import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SummariesService {
  constructor(private readonly prisma: PrismaService) {}

  async createFromExtractedText(extractedTextId: string) {
    const extractedText = await this.prisma.extractedText.findUnique({
      where: { id: extractedTextId },
    });
    if (!extractedText) {
      throw new BadRequestException('Extracted text not found');
    }

    const existing = await this.prisma.summary.findUnique({
      where: { extractedTextId },
    });
    if (existing) {
      throw new BadRequestException('Summary already exists');
    }

    const keywords = Array.isArray(extractedText.keywords)
      ? (extractedText.keywords as string[])
      : [];
    const summary = extractedText.summary || '';

    return this.prisma.summary.create({
      data: {
        extractedTextId: extractedText.id,
        summary,
        keywords,
      },
    });
  }

  async getById(id: string) {
    return this.prisma.summary.findUnique({ where: { id } });
  }

  async listByUser(userId: string, filter?: { extractedTextId?: string }) {
    return this.prisma.summary.findMany({
      where: {
        ...(filter?.extractedTextId
          ? { extractedTextId: filter.extractedTextId }
          : {}),
        extractedText: {
          uploadedFile: { userId },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listAll(filter?: { extractedTextId?: string }) {
    return this.prisma.summary.findMany({
      where: {
        ...(filter?.extractedTextId
          ? { extractedTextId: filter.extractedTextId }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
