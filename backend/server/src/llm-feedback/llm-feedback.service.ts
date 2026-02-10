import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FeedbackQualityFlag, Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { IngestLlmFeedbackDto } from './dto/ingest-llm-feedback.dto';

@Injectable()
export class LlmFeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  async ingest(
    user: { id: string; role?: UserRole | string },
    dto: IngestLlmFeedbackDto,
  ) {
    const session = await this.prisma.experienceSession.findUnique({
      where: { id: dto.sessionId },
      include: {
        actionEvents: true,
        messageLogs: true,
        llmBehaviorEval: true,
        categoryScores: true,
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const isAdmin = user.role === UserRole.ADMIN;
    if (!isAdmin && session.userId !== user.id) {
      throw new ForbiddenException('You do not have access to this session');
    }

    if (!session.llmBehaviorEval) {
      throw new BadRequestException(
        'Session evaluation is required before feedback ingest',
      );
    }

    const inputFeaturesJson =
      dto.inputFeaturesJson ??
      ({
        channel: session.channel,
        scriptId: session.scriptId,
        messageCount: session.messageLogs.length,
        actionCount: session.actionEvents.length,
        avgRiskWeight:
          session.actionEvents.length === 0
            ? 0
            : session.actionEvents.reduce(
                (acc, event) => acc + event.riskWeight,
                0,
              ) / session.actionEvents.length,
      } as Prisma.JsonObject);

    const targetLabelJson =
      dto.targetLabelJson ??
      ({
        overallScore: session.llmBehaviorEval.overallScore,
        confidence: session.llmBehaviorEval.confidence,
        categories: session.categoryScores.map((score) => ({
          categoryCode: score.categoryCode,
          finalScore: score.finalScore,
          label: score.label,
        })),
      } as Prisma.JsonObject);

    const qualityFlag =
      dto.qualityFlag ??
      (session.llmBehaviorEval.confidence >= 0.8
        ? FeedbackQualityFlag.HIGH_CONFIDENCE
        : FeedbackQualityFlag.NEEDS_REVIEW);

    return this.prisma.llmFeedbackDataset.create({
      data: {
        sessionId: session.id,
        inputFeaturesJson: inputFeaturesJson,
        targetLabelJson: targetLabelJson,
        qualityFlag,
        reviewerId: dto.reviewerId,
      },
    });
  }
}
