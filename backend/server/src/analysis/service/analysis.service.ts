import { Injectable, NotFoundException } from '@nestjs/common';
import { ScriptType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ExtractedTextService } from '../../extracted-text/extracted-text.service';
import { SummariesService } from '../../summaries/summaries.service';
import { ScriptsService } from '../../scripts/scripts.service';
import { AnalysisClassifierService } from './analysis-classifier.service';
import { ScriptValidationService } from './script-validation.service';
import { PhishingType } from '../model/phishing-taxonomy';
import { RunAnalysisPipelineDto } from '../dto/run-analysis-pipeline.dto';

@Injectable()
export class AnalysisService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly extractedTextService: ExtractedTextService,
    private readonly summariesService: SummariesService,
    private readonly scriptsService: ScriptsService,
    private readonly analysisClassifierService: AnalysisClassifierService,
    private readonly scriptValidationService: ScriptValidationService,
  ) {}

  async classifyByUploadedFile(userId: string, uploadedFileId: string) {
    await this.assertUploadOwnership(uploadedFileId, userId);
    const extracted = await this.getOrCreateExtractedText(uploadedFileId);
    return this.analysisClassifierService.classifyFromText(
      extracted.cleanText || extracted.rawText,
    );
  }

  async validateScript(script: string, expectedType: PhishingType) {
    return this.scriptValidationService.validateScript(script, expectedType);
  }

  async runPipeline(userId: string, dto: RunAnalysisPipelineDto) {
    const stageResults: Record<string, unknown> = {};
    const startedAt = Date.now();
    let currentStage = 'upload-validation';

    try {
      const upload = await this.assertUploadOwnership(
        dto.uploadedFileId,
        userId,
      );
      stageResults.upload = {
        id: upload.id,
        type: upload.type,
        originalName: upload.originalName,
        storedPath: upload.storedPath,
      };

      currentStage = 'text-extraction';
      const extracted = await this.getOrCreateExtractedText(dto.uploadedFileId);
      stageResults.extraction = {
        id: extracted.id,
        sourceType: extracted.sourceType,
        rawText: extracted.rawText,
        cleanText: extracted.cleanText,
        summary: extracted.summary,
        keywords: extracted.keywords,
        signals: extracted.signals,
        riskScore: extracted.riskScore,
      };

      currentStage = 'type-classification';
      const classification =
        await this.analysisClassifierService.classifyFromText(
          extracted.cleanText || extracted.rawText,
        );
      stageResults.classification = classification;

      currentStage = 'summary-build';
      const summary = await this.getOrCreateSummary(extracted.id);
      stageResults.summary = summary;

      currentStage = 'script-generation';
      const scriptType = dto.scriptType ?? ScriptType.CHAT;
      const scriptContent =
        dto.script || (await this.getOrCreateScript(summary.id, scriptType));
      stageResults.script = {
        type: scriptType,
        content: scriptContent,
      };

      currentStage = 'script-validation';
      const expectedType = dto.expectedType ?? classification.predictedType;
      const validation = await this.scriptValidationService.validateScript(
        scriptContent,
        expectedType,
      );
      stageResults.validation = validation;

      return {
        status: 'success',
        failedStage: null,
        stageResults,
        debug: {
          startedAt: new Date(startedAt).toISOString(),
          finishedAt: new Date().toISOString(),
          elapsedMs: Date.now() - startedAt,
        },
      };
    } catch (error) {
      return {
        status: 'failed',
        failedStage: currentStage,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        stageResults,
        debug: {
          startedAt: new Date(startedAt).toISOString(),
          finishedAt: new Date().toISOString(),
          elapsedMs: Date.now() - startedAt,
        },
      };
    }
  }

  private async assertUploadOwnership(uploadedFileId: string, userId: string) {
    const upload = await this.prisma.uploadedFile.findUnique({
      where: { id: uploadedFileId },
    });
    if (!upload || upload.userId !== userId) {
      throw new NotFoundException('Uploaded file not found');
    }
    return upload;
  }

  private async getOrCreateExtractedText(uploadedFileId: string) {
    const existing = await this.prisma.extractedText.findUnique({
      where: { uploadedFileId },
    });
    if (existing) {
      return existing;
    }
    return this.extractedTextService.createFromUpload(uploadedFileId);
  }

  private async getOrCreateSummary(extractedTextId: string) {
    const existing = await this.prisma.summary.findUnique({
      where: { extractedTextId },
    });
    if (existing) {
      return existing;
    }
    return this.summariesService.createFromExtractedText(extractedTextId);
  }

  private async getOrCreateScript(summaryId: string, type: ScriptType) {
    const existing = await this.prisma.experienceScript.findFirst({
      where: { summaryId, type },
    });
    if (existing) {
      return this.toScriptContent(existing.script);
    }
    const created = await this.scriptsService.createFromSummary(
      summaryId,
      type,
    );
    return this.toScriptContent(created.script);
  }

  private toScriptContent(script: unknown) {
    if (typeof script === 'string') {
      return script;
    }
    if (script && typeof script === 'object') {
      const payload = script as { summary?: unknown; messages?: unknown };
      if (typeof payload.summary === 'string' && payload.summary.trim()) {
        return payload.summary;
      }
      if (Array.isArray(payload.messages)) {
        return payload.messages
          .map((item) => {
            if (item && typeof item === 'object') {
              const message = item as { from?: unknown; text?: unknown };
              if (typeof message.text === 'string') {
                const from =
                  typeof message.from === 'string' ? message.from : 'speaker';
                return `${from}: ${message.text}`;
              }
            }
            return '';
          })
          .filter(Boolean)
          .join('\n');
      }
      return JSON.stringify(script);
    }
    return '';
  }
}
