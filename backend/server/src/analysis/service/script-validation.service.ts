import { Injectable } from '@nestjs/common';
import { KobertEvaluationModel } from '../model/kobert-evaluation.model';
import { PHISHING_KEYWORDS, PhishingType } from '../model/phishing-taxonomy';

type ValidateScriptResult = {
  score: number;
  isValid: boolean;
  reason: string;
  debug: {
    riskLabel: 'phishing' | 'normal';
    riskScore: number;
    contextMatchScore: number;
    naturalnessScore: number;
    detectedKeywordHits: number;
  };
};

@Injectable()
export class ScriptValidationService {
  constructor(private readonly kobertEvaluationModel: KobertEvaluationModel) {}

  async validateScript(
    script: string,
    expectedType: PhishingType,
  ): Promise<ValidateScriptResult> {
    const evaluated = await this.kobertEvaluationModel.evaluateText(script);
    const context = this.measureContextMatch(script, expectedType);
    const naturalness = this.measureNaturalness(script);
    const targetRisk =
      expectedType === '일상 대화'
        ? 1 - evaluated.riskScore
        : evaluated.riskScore;

    const score = this.round(
      targetRisk * 0.4 + context.score * 0.4 + naturalness * 0.2,
    );
    const isValid = score >= 0.7;

    return {
      score,
      isValid,
      reason: this.buildReason({
        expectedType,
        score,
        contextScore: context.score,
        naturalnessScore: naturalness,
        riskScore: evaluated.riskScore,
      }),
      debug: {
        riskLabel: evaluated.label,
        riskScore: this.round(evaluated.riskScore),
        contextMatchScore: context.score,
        naturalnessScore: naturalness,
        detectedKeywordHits: context.hits,
      },
    };
  }

  private measureContextMatch(script: string, expectedType: PhishingType) {
    const keywords = PHISHING_KEYWORDS[expectedType];
    if (!keywords.length) {
      return { hits: 0, score: 0 };
    }
    const lowered = script.toLowerCase();
    const hits = keywords.filter((keyword) =>
      lowered.includes(keyword.toLowerCase()),
    ).length;
    return {
      hits,
      score: this.round(Math.min(1, hits / Math.min(keywords.length, 5))),
    };
  }

  private measureNaturalness(script: string) {
    const compact = script.trim();
    if (!compact) {
      return 0;
    }
    const sentences = compact
      .split(/[.!?。！？\n]/)
      .map((chunk) => chunk.trim())
      .filter(Boolean);
    const avgLength =
      sentences.reduce((acc, curr) => acc + curr.length, 0) /
      Math.max(sentences.length, 1);
    const repeatedChars = /(.)\1{4,}/.test(compact) ? 1 : 0;
    const urlPenalty =
      /(https?:\/\/|bit\.ly|tinyurl|[\w-]+\.(com|kr|net)\/)/i.test(compact)
        ? 0.1
        : 0;

    let score = 0.4;
    if (sentences.length >= 2) {
      score += 0.2;
    }
    if (avgLength >= 8 && avgLength <= 55) {
      score += 0.25;
    }
    if (compact.length >= 30) {
      score += 0.15;
    }
    if (repeatedChars) {
      score -= 0.2;
    }
    score -= urlPenalty;
    return this.round(Math.max(0, Math.min(1, score)));
  }

  private buildReason(params: {
    expectedType: PhishingType;
    score: number;
    contextScore: number;
    naturalnessScore: number;
    riskScore: number;
  }) {
    const { expectedType, score, contextScore, naturalnessScore, riskScore } =
      params;
    const core =
      score >= 0.7
        ? `${expectedType} 유형에 맞는 문맥이 비교적 자연스럽게 구성되었습니다.`
        : `${expectedType} 유형과의 정합성이 부족하거나 문장 흐름이 어색합니다.`;

    return `${core} 문맥=${contextScore}, 자연스러움=${naturalnessScore}, 위험도=${this.round(
      riskScore,
    )}`;
  }

  private round(value: number) {
    return Math.round(value * 1000) / 1000;
  }
}
