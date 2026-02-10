import { CategoryCode, ScoreLabel } from "@prisma/client";

export type EvaluationCategory = {
  categoryCode: CategoryCode;
  score: number;
  label: ScoreLabel;
  evidence: string[];
  riskFlags: string[];
};

export const CATEGORY_WEIGHTS: Record<CategoryCode, number> = {
  [CategoryCode.DETECT_SIGNAL]: 0.3,
  [CategoryCode.REFUSE_REQUEST]: 0.3,
  [CategoryCode.VERIFY_IDENTITY]: 0.25,
  [CategoryCode.REPORTING]: 0.15,
};

const SCORE_MIN = 0;
const SCORE_MAX = 100;
const CONFIDENCE_PENALTY_THRESHOLD = 0.55;
const CONFIDENCE_LABEL_PENALTY = 10;

export function round(value: number) {
  return Math.round(value);
}

export function clampScore(score: number) {
  return Math.max(SCORE_MIN, Math.min(SCORE_MAX, round(score)));
}

export function toLabel(score: number): ScoreLabel {
  if (score >= 90) return ScoreLabel.A;
  if (score >= 75) return ScoreLabel.B;
  if (score >= 60) return ScoreLabel.C;
  if (score >= 40) return ScoreLabel.D;
  return ScoreLabel.E;
}

export function computeBehaviorScore(riskWeights: number[]) {
  const raw = 50 - riskWeights.reduce((acc, weight) => acc + weight * 20, 0);
  return clampScore(raw);
}

export function computeConfidence(eventCount: number, messageCount: number) {
  const raw = 0.4 + Math.min(0.3, eventCount * 0.05) + Math.min(0.3, messageCount * 0.03);
  return Math.min(0.98, round(raw * 100) / 100);
}

export function buildEvaluationCategories(
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
    const score = clampScore(raw);
    return {
      categoryCode,
      score,
      label: toLabel(score),
      evidence: [`행동 로그 기반 점수 ${score}점`, `이벤트 ${eventCount}개 반영`],
      riskFlags: score < 60 ? ["추가 학습 권장"] : [],
    };
  });
}

export function buildEducationMessage(categories: EvaluationCategory[]) {
  const weak = [...categories].sort((a, b) => a.score - b.score)[0];
  return {
    summary: `${weak.categoryCode} 역량 보강이 필요합니다.`,
    tips: [tipByCategory(weak.categoryCode)],
  };
}

export function computeSurveyScore(answersJson: unknown, isSkipped: boolean) {
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
  return clampScore(((avg - 1) / 4) * 100);
}

export function computeFinalCategoryScore(
  behaviorScore: number,
  llmScore: number,
  surveyScore: number | null,
  confidence: number,
) {
  const merged =
    surveyScore === null
      ? 0.7 * behaviorScore + 0.3 * llmScore
      : 0.6 * behaviorScore + 0.25 * llmScore + 0.15 * surveyScore;
  const penalized =
    confidence < CONFIDENCE_PENALTY_THRESHOLD ? merged - CONFIDENCE_LABEL_PENALTY : merged;
  return clampScore(penalized);
}

export function computeOverallScore(
  scores: Array<{ categoryCode: CategoryCode; finalScore: number }>,
) {
  return round(
    scores.reduce(
      (acc, score) => acc + score.finalScore * CATEGORY_WEIGHTS[score.categoryCode],
      0,
    ),
  );
}

export function tipByCategory(category: CategoryCode) {
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
