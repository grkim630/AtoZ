import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CategoryCode, ScoreLabel, SessionStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateSessionDto } from "./dto/create-session.dto";
import { CreateSessionEventDto } from "./dto/create-session-event.dto";
import { CreateSessionMessageDto } from "./dto/create-session-message.dto";
import { EvaluateSessionDto } from "./dto/evaluate-session.dto";
import { SubmitSessionSurveyDto } from "./dto/submit-session-survey.dto";

type EvaluationCategory = {
  categoryCode: CategoryCode;
  score: number;
  label: ScoreLabel;
  evidence: string[];
  riskFlags: string[];
};

@Injectable()
export class SessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async createSession(userId: string, dto: CreateSessionDto) {
    const script = await this.prisma.experienceScript.findUnique({
      where: { id: dto.scriptId },
      select: { id: true },
    });
    if (!script) {
      throw new BadRequestException("Script not found");
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

  async addMessage(userId: string, sessionId: string, dto: CreateSessionMessageDto) {
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

  async addEvent(userId: string, sessionId: string, dto: CreateSessionEventDto) {
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

  async submitSurvey(userId: string, sessionId: string, dto: SubmitSessionSurveyDto) {
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

  async evaluateSession(userId: string, sessionId: string, dto: EvaluateSessionDto) {
    await this.getOwnedSession(userId, sessionId);
    const events = await this.prisma.sessionActionEvent.findMany({
      where: { sessionId },
      orderBy: { timestamp: "asc" },
    });
    const messages = await this.prisma.sessionMessageLog.count({ where: { sessionId } });

    const behaviorBase = this.computeBehaviorScore(events.map((event) => event.riskWeight));
    const categories = this.buildEvaluationCategories(behaviorBase, events.length, messages);
    const overallScore = this.round(
      categories.reduce((acc, item) => acc + item.score, 0) / categories.length,
    );
    const confidence = this.computeConfidence(events.length, messages);

    const outputJson = {
      overallScore,
      confidence,
      categories: categories.map((category) => ({
        categoryCode: category.categoryCode,
        score: category.score,
        label: category.label,
        evidence: category.evidence,
        riskFlags: category.riskFlags,
      })),
      educationMessage: this.buildEducationMessage(categories),
    };

    const evaluation = await this.prisma.llmBehaviorEvaluation.upsert({
      where: { sessionId },
      create: {
        sessionId,
        promptVersion: dto.promptVersion ?? "v1",
        model: dto.model ?? "mock-evaluator",
        outputJson,
        overallScore,
        confidence,
      },
      update: {
        promptVersion: dto.promptVersion ?? "v1",
        model: dto.model ?? "mock-evaluator",
        outputJson,
        overallScore,
        confidence,
        createdAt: new Date(),
      },
    });

    return {
      evaluationId: evaluation.id,
      overallScore: evaluation.overallScore,
      confidence: evaluation.confidence,
      outputJson: evaluation.outputJson,
    };
  }

  async getEvaluation(userId: string, sessionId: string) {
    await this.getOwnedSession(userId, sessionId);
    const evaluation = await this.prisma.llmBehaviorEvaluation.findUnique({
      where: { sessionId },
    });
    if (!evaluation) {
      throw new NotFoundException("Evaluation not found");
    }
    return evaluation;
  }

  async finalizeSession(userId: string, sessionId: string) {
    await this.getOwnedSession(userId, sessionId);
    let evaluation = await this.prisma.llmBehaviorEvaluation.findUnique({
      where: { sessionId },
    });
    if (!evaluation) {
      const generated = await this.evaluateSession(userId, sessionId, {});
      evaluation = await this.prisma.llmBehaviorEvaluation.findUnique({
        where: { id: generated.evaluationId },
      });
    }
    if (!evaluation) {
      throw new BadRequestException("Failed to evaluate session");
    }

    const survey = await this.prisma.surveyResponse.findUnique({
      where: { sessionId },
    });

    const output = evaluation.outputJson as {
      categories?: Array<{ categoryCode: CategoryCode; score: number }>;
      confidence?: number;
    };
    const categories = output.categories ?? [];
    const surveyScore = this.computeSurveyScore(survey?.answersJson ?? null, survey?.isSkipped ?? true);

    for (const category of categories) {
      const behaviorScore = this.round(Math.max(0, Math.min(100, category.score - 5)));
      const llmScore = this.round(Math.max(0, Math.min(100, category.score)));
      const finalScore =
        surveyScore === null
          ? this.round(0.7 * behaviorScore + 0.3 * llmScore)
          : this.round(0.6 * behaviorScore + 0.25 * llmScore + 0.15 * surveyScore);

      const adjusted = (output.confidence ?? 1) < 0.55 ? finalScore - 10 : finalScore;
      const safeScore = Math.max(0, adjusted);

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
          label: this.toLabel(safeScore),
        },
        update: {
          behaviorScore,
          llmScore,
          surveyScore,
          finalScore: safeScore,
          label: this.toLabel(safeScore),
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
        orderBy: { categoryCode: "asc" },
      }),
      this.prisma.llmBehaviorEvaluation.findUnique({ where: { sessionId } }),
    ]);

    if (!session) {
      throw new NotFoundException("Session not found");
    }
    if (scores.length === 0) {
      throw new NotFoundException("Result not found. Run finalize first.");
    }

    const weightByCategory: Record<CategoryCode, number> = {
      [CategoryCode.DETECT_SIGNAL]: 0.3,
      [CategoryCode.REFUSE_REQUEST]: 0.3,
      [CategoryCode.VERIFY_IDENTITY]: 0.25,
      [CategoryCode.REPORTING]: 0.15,
    };

    const overallScore = this.round(
      scores.reduce(
        (acc, score) => acc + score.finalScore * weightByCategory[score.categoryCode],
        0,
      ),
    );

    const weakest = [...scores].sort((a, b) => a.finalScore - b.finalScore).slice(0, 2);
    const tips = weakest.map((item) => this.tipByCategory(item.categoryCode));

    return {
      sessionId: session.id,
      status: session.status,
      overallScore,
      label: this.toLabel(overallScore),
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
      select: { id: true, userId: true },
    });
    if (!session) {
      throw new NotFoundException("Session not found");
    }
    if (session.userId !== userId) {
      throw new ForbiddenException("You do not have access to this session");
    }
    return session;
  }

  private computeBehaviorScore(riskWeights: number[]) {
    const score = 50 - riskWeights.reduce((acc, weight) => acc + weight * 20, 0);
    return Math.max(0, Math.min(100, this.round(score)));
  }

  private computeConfidence(eventCount: number, messageCount: number) {
    const raw = 0.4 + Math.min(0.3, eventCount * 0.05) + Math.min(0.3, messageCount * 0.03);
    return Math.min(0.98, this.round(raw * 100) / 100);
  }

  private buildEvaluationCategories(
    behaviorBase: number,
    eventCount: number,
    messageCount: number,
  ): EvaluationCategory[] {
    const signalBonus = Math.min(10, messageCount * 2);
    const reportingBonus = eventCount > 0 ? 5 : 0;

    const categoryScores: Array<[CategoryCode, number]> = [
      [CategoryCode.DETECT_SIGNAL, behaviorBase + signalBonus],
      [CategoryCode.REFUSE_REQUEST, behaviorBase],
      [CategoryCode.VERIFY_IDENTITY, behaviorBase - 5],
      [CategoryCode.REPORTING, behaviorBase + reportingBonus - 10],
    ];

    return categoryScores.map(([categoryCode, raw]) => {
      const score = Math.max(0, Math.min(100, this.round(raw)));
      return {
        categoryCode,
        score,
        label: this.toLabel(score),
        evidence: [`행동 로그 기반 점수 ${score}점`, `이벤트 ${eventCount}개 반영`],
        riskFlags: score < 60 ? ["추가 학습 권장"] : [],
      };
    });
  }

  private buildEducationMessage(categories: EvaluationCategory[]) {
    const weak = [...categories].sort((a, b) => a.score - b.score)[0];
    return {
      summary: `${weak.categoryCode} 역량 보강이 필요합니다.`,
      tips: [this.tipByCategory(weak.categoryCode)],
    };
  }

  private computeSurveyScore(answersJson: unknown, isSkipped: boolean) {
    if (isSkipped || !answersJson || typeof answersJson !== "object") {
      return null;
    }
    const obj = answersJson as Record<string, unknown>;
    const keys = ["realism", "helpfulness", "confidence"];
    const values = keys
      .map((key) => obj[key])
      .filter((value): value is number => typeof value === "number");
    if (values.length === 0) {
      return null;
    }
    const avg = values.reduce((acc, value) => acc + value, 0) / values.length;
    return this.round(((avg - 1) / 4) * 100);
  }

  private toLabel(score: number): ScoreLabel {
    if (score >= 90) return ScoreLabel.A;
    if (score >= 75) return ScoreLabel.B;
    if (score >= 60) return ScoreLabel.C;
    if (score >= 40) return ScoreLabel.D;
    return ScoreLabel.E;
  }

  private tipByCategory(category: CategoryCode) {
    if (category === CategoryCode.DETECT_SIGNAL) {
      return "긴급 요청, 금전 요구, 링크 유도 문구를 우선 의심하세요.";
    }
    if (category === CategoryCode.REFUSE_REQUEST) {
      return "금전/개인정보 요청에는 즉시 거절 후 대화를 중단하세요.";
    }
    if (category === CategoryCode.VERIFY_IDENTITY) {
      return "반드시 공식 연락처로 역확인하고, 발신자 정보만 믿지 마세요.";
    }
    return "의심 사례는 즉시 차단 후 기관 신고 절차를 수행하세요.";
  }

  private round(value: number) {
    return Math.round(value);
  }
}
