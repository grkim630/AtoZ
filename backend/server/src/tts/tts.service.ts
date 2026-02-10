import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ScriptType } from '@prisma/client';
import { AiMockService } from '../ai/ai-mock.service';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class TtsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiMockService: AiMockService,
    private readonly configService: ConfigService,
  ) {}

  async createFromScript(scriptId: string) {
    const script = await this.prisma.experienceScript.findUnique({
      where: { id: scriptId },
    });
    if (!script) {
      throw new BadRequestException('Script not found');
    }
    if (script.type !== ScriptType.CALL) {
      throw new BadRequestException('TTS is only available for CALL scripts');
    }

    const existing = await this.prisma.ttsFile.findUnique({
      where: { scriptId },
    });
    if (existing) {
      throw new BadRequestException('TTS already exists');
    }

    const ttsContent = this.aiMockService.textToSpeech(
      JSON.stringify(script.script),
    );

    const root = this.configService.get<string>('UPLOAD_DIR') ?? 'uploads';
    const ttsDir = path.join(root, 'tts');
    await fs.promises.mkdir(ttsDir, { recursive: true });

    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.txt`;
    const storedPath = path.join(ttsDir, filename);
    await fs.promises.writeFile(storedPath, ttsContent, 'utf-8');

    return this.prisma.ttsFile.create({
      data: {
        scriptId: script.id,
        storedPath,
      },
    });
  }

  async getById(id: string) {
    return this.prisma.ttsFile.findUnique({ where: { id } });
  }

  async listByUser(userId: string, filter?: { scriptId?: string }) {
    return this.prisma.ttsFile.findMany({
      where: {
        ...(filter?.scriptId ? { scriptId: filter.scriptId } : {}),
        script: {
          summary: {
            extractedText: {
              uploadedFile: { userId },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listAll(filter?: { scriptId?: string }) {
    return this.prisma.ttsFile.findMany({
      where: {
        ...(filter?.scriptId ? { scriptId: filter.scriptId } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
