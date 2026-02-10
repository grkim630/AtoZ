import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CategoryCode,
  EvaluationJobStatus,
  Prisma,
  SessionStatus,
} from '@prisma/client/index';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { CreateSessionEventDto } from './dto/create-session-event.dto';
import { CreateSessionMessageDto } from './dto/create-session-message.dto';
import { EvaluateSessionDto } from './dto/evaluate-session.dto';
import { SubmitSessionSurveyDto } from './dto/submit-session-survey.dto';
import {
  clampScore,
  computeFinalCategoryScore,
  computeOverallScore,
  computeSurveyScore,
  tipByCategory,
  toLabel,
} from './sessions-scoring';
import { SessionEvaluatorService } from './session-evaluator.service';

@Injectable()
export class SessionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sessionEvaluatorService: SessionEvaluatorService,
  ) {}

  async createSession(userId: string, dto: CreateSessionDto) {
    const script = await this.prisma.experienceScript.findUnique({
      where: { id: dto.scriptId },
      select: { id: true },
    });
    if (!script) {
      throw new BadRequestException('Script not found');
    }

    return this.prisma.experienceSession.create({
      data: {
        userId,
        scriptId: dto.scriptId,
        channel: dto.channel,
        scriptVersion: dto.scriptVersion,
        llmModelVersion: dto.llmModelVersion,
      },
    });
  }

  async addMessage(
    userId: string,
    sessionId: string,
    dto: CreateSessionMessageDto,
  ) {
    await this.getOwnedSession(userId, sessionId);
    return this.prisma.sessionMessageLog.create({
      data: {
        sessionId,
        turnIndex: dto.turnIndex,
        speaker: dto.speaker,
        text: dto.text,
        maskedText: dto.maskedText ?? dto.text,
        timestamp: dto.timestamp ? new Date(dto.timestamp) : new Date(),
      },
    });
  }

  async addEvent(
    userId: string,
    sessionId: string,
    dto: CreateSessionEventDto,
  ) {
    await this.getOwnedSession(userId, sessionId);
    return this.prisma.sessionActionEvent.create({
      data: {
        sessionId,
        eventType: dto.eventType,
        actionCode: dto.actionCode,
        riskWeight: dto.riskWeight,
        stepNo: dto.stepNo,
        timestamp: dto.timestamp ? new Date(dto.timestamp) : new Date(),
      },
    });
  }

  async submitSurvey(
    userId: string,
    sessionId: string,
    dto: SubmitSessionSurveyDto,
  ) {
    await this.getOwnedSession(userId, sessionId);
    return this.prisma.surveyResponse.upsert({
      where: { sessionId },
      create: {
        sessionId,
        answersJson: dto.answersJson,
        isSkipped: dto.isSkipped ?? false,
      },
      update: {
        answersJson: dto.answersJson,
        isSkipped: dto.isSkipped ?? false,
        submittedAt: new Date(),
      },
    });
  }

  async evaluateSession(
    userId: string,
    sessionId: string,
    dto: EvaluateSessionDto,
  ) {
    await this.getOwnedSession(userId, sessionId);
    const promptVersion = dto.promptVersion ?? 'v1';
    const model = dto.model ?? 'gpt-4o-mini';

    const job = await this.prisma.sessionEvaluationJob.create({
      data: {
        sessionId,
        promptVersion,
        model,
        status: EvaluationJobStatus.QUEUED,
      },
    });

    void this.runEvaluationJob(job.id).catch(async (error) => {
      await this.prisma.sessionEvaluationJob.update({
        where: { id: job.id },
        data: {
          status: EvaluationJobStatus.FAILED,
          errorMessage: String(error),
          completedAt: new Date(),
        },
      });
    });

    return {
      evaluationJobId: job.id,
      status: job.status,
    };
  }

  async getEvaluation(userId: string, sessionId: string, jobId?: string) {
    await this.getOwnedSession(userId, sessionId);

    const job = await this.getEvaluationJob(sessionId, jobId);
    const evaluation = await this.prisma.llmBehaviorEvaluation.findUnique({
      where: { sessionId },
    });

    if (!job && !evaluation) {
      throw new NotFoundException('Evaluation not found');
    }
    if (!job) {
      return {
        status: EvaluationJobStatus.COMPLETED,
        evaluation,
      };
    }

    return {
      evaluationJobId: job.id,
      status: job.status,
      errorMessage: job.errorMessage,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
      evaluation:
        job.status === EvaluationJobStatus.COMPLETED ? evaluation : null,
    };
  }

  async finalizeSession(userId: string, sessionId: string) {
    await this.getOwnedSession(userId, sessionId);
    const activeJob = await this.prisma.sessionEvaluationJob.findFirst({
      where: {
        sessionId,
        status: {
          in: [EvaluationJobStatus.QUEUED, EvaluationJobStatus.RUNNING],
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    if (activeJob) {
      throw new BadRequestException(
        'Evaluation is still in progress. Retry finalize after evaluation completes.',
      );
    }

    let evaluation = await this.prisma.llmBehaviorEvaluation.findUnique({
      where: { sessionId },
    });
    if (!evaluation) {
      evaluation = await this.evaluateAndPersist(
        sessionId,
        'v1',
        'gpt-4o-mini',
      );
    }
    if (!evaluation) {
      throw new BadRequestException('Failed to evaluate session');
    }

    const survey = await this.prisma.surveyResponse.findUnique({
      where: { sessionId },
    });

    const output = evaluation.outputJson as {
      categories?: Array<{ categoryCode: CategoryCode; score: number }>;
      confidence?: number;
    };
    const categories = output.categories ?? [];
    const surveyScore = computeSurveyScore(
      survey?.answersJson ?? null,
      survey?.isSkipped ?? true,
    );

    for (const category of categories) {
      const behaviorScore = clampScore(category.score - 5);
      const llmScore = clampScore(category.score);
      const safeScore = computeFinalCategoryScore(
        behaviorScore,
        llmScore,
        surveyScore,
        output.confidence ?? 1,
      );

      await this.prisma.sessionCategoryScore.upsert({
        where: {
          sessionId_categoryCode: {
            sessionId,
            categoryCode: category.categoryCode,
          },
        },
        create: {
          sessionId,
          categoryCode: category.categoryCode,
          behaviorScore,
          llmScore,
          surveyScore,
          finalScore: safeScore,
          label: toLabel(safeScore),
        },
        update: {
          behaviorScore,
          llmScore,
          surveyScore,
          finalScore: safeScore,
          label: toLabel(safeScore),
        },
      });
    }

    await this.prisma.experienceSession.update({
      where: { id: sessionId },
      data: {
        status: SessionStatus.COMPLETED,
        endedAt: new Date(),
      },
    });

    return this.getResult(userId, sessionId);
  }

  async getResult(userId: string, sessionId: string) {
    await this.getOwnedSession(userId, sessionId);
    const [session, scores, evaluation] = await Promise.all([
      this.prisma.experienceSession.findUnique({ where: { id: sessionId } }),
      this.prisma.sessionCategoryScore.findMany({
        where: { sessionId },
        orderBy: { categoryCode: 'asc' },
      }),
      this.prisma.llmBehaviorEvaluation.findUnique({ where: { sessionId } }),
    ]);

    if (!session) {
      throw new NotFoundException('Session not found');
    }
    if (scores.length === 0) {
      throw new NotFoundException('Result not found. Run finalize first.');
    }

    const overallScore = computeOverallScore(scores);

    const weakest = [...scores]
      .sort((a, b) => a.finalScore - b.finalScore)
      .slice(0, 2);
    const tips = weakest.map((item) => tipByCategory(item.categoryCode));

    return {
      sessionId: session.id,
      status: session.status,
      overallScore,
      label: toLabel(overallScore),
      categories: scores,
      evaluationSummary: {
        confidence: evaluation?.confidence ?? null,
        overallScore: evaluation?.overallScore ?? null,
      },
      educationTips: tips,
    };
  }

  private async getOwnedSession(userId: string, sessionId: string) {
    const session = await this.prisma.experienceSession.findUnique({
      where: { id: sessionId },
      include: {
        script: {
          select: {
            type: true,
            script: true,
          },
        },
      },
    });
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    if (session.userId !== userId) {
      throw new ForbiddenException('You do not have access to this session');
    }
    return session;
  }

  private async getEvaluationJob(sessionId: string, jobId?: string) {
    if (jobId) {
      return this.prisma.sessionEvaluationJob.findFirst({
        where: {
          id: jobId,
          sessionId,
        },
      });
    }
    return this.prisma.sessionEvaluationJob.findFirst({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async runEvaluationJob(jobId: string) {
    const job = await this.prisma.sessionEvaluationJob.findUnique({
      where: { id: jobId },
    });
    if (!job) {
      throw new NotFoundException('Evaluation job not found');
    }

    await this.prisma.sessionEvaluationJob.update({
      where: { id: jobId },
      data: {
        status: EvaluationJobStatus.RUNNING,
        errorMessage: null,
      },
    });

    try {
      await this.evaluateAndPersist(
        job.sessionId,
        job.promptVersion,
        job.model,
      );
      await this.prisma.sessionEvaluationJob.update({
        where: { id: jobId },
        data: {
          status: EvaluationJobStatus.COMPLETED,
          completedAt: new Date(),
        },
      });
    } catch (error) {
      await this.prisma.sessionEvaluationJob.update({
        where: { id: jobId },
        data: {
          status: EvaluationJobStatus.FAILED,
          errorMessage: String(error),
          completedAt: new Date(),
        },
      });
      throw error;
    }
  }

  private async evaluateAndPersist(
    sessionId: string,
    promptVersion: string,
    model: string,
  ) {
    const session = await this.prisma.experienceSession.findUnique({
      where: { id: sessionId },
      include: {
        script: {
          select: {
            type: true,
            script: true,
          },
        },
      },
    });
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const [events, messageLogs] = await Promise.all([
      this.prisma.sessionActionEvent.findMany({
        where: { sessionId },
        orderBy: { timestamp: 'asc' },
      }),
      this.prisma.sessionMessageLog.findMany({
        where: { sessionId },
        orderBy: { turnIndex: 'asc' },
      }),
    ]);

    const evaluated = await this.sessionEvaluatorService.evaluate({
      scriptType: session.script.type,
      scriptContent:
        typeof session.script.script === 'string'
          ? session.script.script
          : JSON.stringify(session.script.script),
      messageLogs: messageLogs.map((message) => ({
        speaker: message.speaker,
        text: message.text,
        maskedText: message.maskedText,
      })),
      actionEvents: events.map((event) => ({
        eventType: event.eventType,
        actionCode: event.actionCode,
        riskWeight: event.riskWeight,
        stepNo: event.stepNo,
      })),
      promptVersion,
      model,
    });

    const outputJson: Prisma.JsonObject = {
      overallScore: evaluated.overallScore,
      confidence: evaluated.confidence,
      categories: evaluated.categories as unknown as Prisma.JsonArray,
      educationMessage:
        evaluated.educationMessage as unknown as Prisma.JsonObject,
      meta: {
        mode: evaluated.mode,
        modelUsed: evaluated.modelUsed,
      },
    };

    return this.prisma.llmBehaviorEvaluation.upsert({
      where: { sessionId },
      create: {
        sessionId,
        promptVersion,
        model: evaluated.modelUsed,
        outputJson,
        overallScore: evaluated.overallScore,
        confidence: evaluated.confidence,
      },
      update: {
        promptVersion,
        model: evaluated.modelUsed,
        outputJson,
        overallScore: evaluated.overallScore,
        confidence: evaluated.confidence,
        createdAt: new Date(),
      },
    });
  }
}
