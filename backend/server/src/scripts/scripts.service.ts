import { BadRequestException, Injectable } from '@nestjs/common';
import { ScriptType } from '@prisma/client';
import { AiMockService } from '../ai/ai-mock.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ScriptsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiMockService: AiMockService,
  ) {}

  async createFromSummary(summaryId: string, type: ScriptType) {
    const summary = await this.prisma.summary.findUnique({
      where: { id: summaryId },
    });
    if (!summary) {
      throw new BadRequestException('Summary not found');
    }

    const existing = await this.prisma.experienceScript.findFirst({
      where: { summaryId, type },
    });
    if (existing) {
      throw new BadRequestException('Script for this type already exists');
    }

    const keywords = Array.isArray(summary.keywords)
      ? (summary.keywords as string[])
      : [];

    const script = this.aiMockService.generateScript(
      type,
      summary.summary,
      keywords,
    );

    return this.prisma.experienceScript.create({
      data: {
        summaryId: summary.id,
        type,
        script,
      },
    });
  }

  async getById(id: string) {
    return this.prisma.experienceScript.findUnique({ where: { id } });
  }

  async listByUser(
    userId: string,
    filter?: { summaryId?: string; type?: ScriptType },
  ) {
    return this.prisma.experienceScript.findMany({
      where: {
        ...(filter?.summaryId ? { summaryId: filter.summaryId } : {}),
        ...(filter?.type ? { type: filter.type } : {}),
        summary: {
          extractedText: {
            uploadedFile: {
              userId,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listAll(filter?: { summaryId?: string; type?: ScriptType }) {
    return this.prisma.experienceScript.findMany({
      where: {
        ...(filter?.summaryId ? { summaryId: filter.summaryId } : {}),
        ...(filter?.type ? { type: filter.type } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
