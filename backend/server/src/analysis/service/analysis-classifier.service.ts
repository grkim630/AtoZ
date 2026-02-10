import { Injectable } from '@nestjs/common';
import {
  PHISHING_KEYWORDS,
  PHISHING_TYPES,
  PhishingType,
} from '../model/phishing-taxonomy';
import { KobertEvaluationModel } from '../model/kobert-evaluation.model';

type ClassifyResult = {
  extractedText: string;
  predictedType: PhishingType;
  confidence: number;
  allScores: Record<PhishingType, number>;
  debug: {
    riskLabel: 'phishing' | 'normal';
    riskScore: number;
    keywordHits: Record<PhishingType, number>;
  };
};

@Injectable()
export class AnalysisClassifierService {
  constructor(private readonly kobertEvaluationModel: KobertEvaluationModel) {}

  async classifyFromText(text: string): Promise<ClassifyResult> {
    const evaluated = await this.kobertEvaluationModel.evaluateText(text);
    const keywordHits = this.countKeywordHits(evaluated.cleanText);

    const rawScores: Record<PhishingType, number> = {
      '경찰 사칭': 0.01,
      '법원 사칭': 0.01,
      '택배 배송 사칭': 0.01,
      '자녀 사칭': 0.01,
      '해외 송금 사기': 0.01,
      '지인 사칭': 0.01,
      '일상 대화': 0.01,
    };

    if (evaluated.riskScore < 0.35) {
      rawScores['일상 대화'] += 1.2 - evaluated.riskScore;
      for (const type of PHISHING_TYPES) {
        if (type === '일상 대화') {
          continue;
        }
        rawScores[type] += keywordHits[type] * 0.08;
      }
    } else {
      rawScores['일상 대화'] += (1 - evaluated.riskScore) * 0.2;
      for (const type of PHISHING_TYPES) {
        if (type === '일상 대화') {
          continue;
        }
        rawScores[type] += evaluated.riskScore * 0.45 + keywordHits[type] * 0.3;
      }
    }

    const allScores = this.normalize(rawScores);
    const predictedType = this.pickTopType(allScores);
    return {
      extractedText: evaluated.cleanText,
      predictedType,
      confidence: allScores[predictedType],
      allScores,
      debug: {
        riskLabel: evaluated.label,
        riskScore: this.round(evaluated.riskScore),
        keywordHits,
      },
    };
  }

  private countKeywordHits(text: string): Record<PhishingType, number> {
    const lowered = text.toLowerCase();
    const scores = {} as Record<PhishingType, number>;
    for (const type of PHISHING_TYPES) {
      const keywords = PHISHING_KEYWORDS[type];
      scores[type] = keywords.reduce(
        (acc, keyword) =>
          lowered.includes(keyword.toLowerCase()) ? acc + 1 : acc,
        0,
      );
    }
    return scores;
  }

  private normalize(scores: Record<PhishingType, number>) {
    const sum = Object.values(scores).reduce((acc, value) => acc + value, 0);
    const normalized = {} as Record<PhishingType, number>;
    for (const type of PHISHING_TYPES) {
      normalized[type] = this.round((scores[type] ?? 0) / (sum || 1));
    }
    return normalized;
  }

  private pickTopType(scores: Record<PhishingType, number>) {
    return PHISHING_TYPES.reduce((prev, curr) =>
      (scores[curr] ?? 0) > (scores[prev] ?? 0) ? curr : prev,
    );
  }

  private round(value: number) {
    return Math.round(value * 1000) / 1000;
  }
}
