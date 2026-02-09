import { CategoryCode, ScoreLabel } from "@prisma/client";
import {
  clampScore,
  computeFinalCategoryScore,
  computeOverallScore,
  computeSurveyScore,
  toLabel,
} from "./sessions-scoring";

describe("sessions-scoring", () => {
  it("clampScore should keep range 0~100", () => {
    expect(clampScore(-5)).toBe(0);
    expect(clampScore(57.7)).toBe(58);
    expect(clampScore(140)).toBe(100);
  });

  it("toLabel should map score by rubric", () => {
    expect(toLabel(95)).toBe(ScoreLabel.A);
    expect(toLabel(80)).toBe(ScoreLabel.B);
    expect(toLabel(63)).toBe(ScoreLabel.C);
    expect(toLabel(45)).toBe(ScoreLabel.D);
    expect(toLabel(22)).toBe(ScoreLabel.E);
  });

  it("computeSurveyScore should convert Likert scale to 0~100", () => {
    const score = computeSurveyScore(
      {
        realism: 5,
        helpfulness: 4,
        confidence: 3,
      },
      false,
    );
    expect(score).toBe(75);
  });

  it("computeFinalCategoryScore should apply confidence penalty", () => {
    const noPenalty = computeFinalCategoryScore(70, 80, 90, 0.9);
    const penalty = computeFinalCategoryScore(70, 80, 90, 0.4);
    expect(noPenalty).toBe(76);
    expect(penalty).toBe(66);
  });

  it("computeOverallScore should apply category weights", () => {
    const score = computeOverallScore([
      { categoryCode: CategoryCode.DETECT_SIGNAL, finalScore: 100 },
      { categoryCode: CategoryCode.REFUSE_REQUEST, finalScore: 80 },
      { categoryCode: CategoryCode.VERIFY_IDENTITY, finalScore: 60 },
      { categoryCode: CategoryCode.REPORTING, finalScore: 40 },
    ]);
    expect(score).toBe(75);
  });
});
