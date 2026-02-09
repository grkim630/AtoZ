import { Injectable, Logger } from "@nestjs/common";
import { CategoryCode } from "@prisma/client";
import {
  buildEducationMessage,
  buildEvaluationCategories,
  computeBehaviorScore,
  computeConfidence,
} from "./sessions-scoring";

type EvaluatorInput = {
  scriptType: "CHAT" | "CALL";
  scriptContent: string;
  messageLogs: Array<{ speaker: string; text: string; maskedText: string }>;
  actionEvents: Array<{ eventType: string; actionCode: string; riskWeight: number; stepNo: number | null }>;
  promptVersion: string;
  model: string;
};

type EvaluatorResult = {
  overallScore: number;
  confidence: number;
  categories: Array<{
    categoryCode: CategoryCode;
    score: number;
    label: string;
    evidence: string[];
    riskFlags: string[];
  }>;
  educationMessage: {
    summary: string;
    tips: string[];
  };
  mode: "openai" | "mock";
  modelUsed: string;
};

@Injectable()
export class SessionEvaluatorService {
  private readonly logger = new Logger(SessionEvaluatorService.name);
  private readonly endpoint = process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1/responses";
  private readonly timeoutMs = Number(process.env.OPENAI_TIMEOUT_MS ?? 15000);

  async evaluate(input: EvaluatorInput): Promise<EvaluatorResult> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return this.mockEvaluate(input, "mock-evaluator:no-api-key");
    }

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);

      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: input.model,
          input: [
            { role: "system", content: this.buildSystemPrompt() },
            { role: "user", content: this.buildUserPrompt(input) },
          ],
          temperature: 0.1,
        }),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        const body = await response.text();
        this.logger.warn(`OpenAI evaluate failed: ${response.status} ${body}`);
        return this.mockEvaluate(input, `mock-evaluator:http-${response.status}`);
      }

      const json = (await response.json()) as Record<string, unknown>;
      const parsed = this.parseOpenAiResponse(json);
      if (!parsed) {
        this.logger.warn("OpenAI evaluate returned unparsable payload");
        return this.mockEvaluate(input, "mock-evaluator:parse-failed");
      }

      return {
        ...parsed,
        mode: "openai",
        modelUsed: input.model,
      };
    } catch (error) {
      this.logger.warn(`OpenAI evaluate exception: ${String(error)}`);
      return this.mockEvaluate(input, "mock-evaluator:exception");
    }
  }

  private mockEvaluate(input: EvaluatorInput, modelUsed: string): EvaluatorResult {
    const behaviorBase = computeBehaviorScore(input.actionEvents.map((event) => event.riskWeight));
    const categories = buildEvaluationCategories(
      behaviorBase,
      input.actionEvents.length,
      input.messageLogs.length,
    );
    const overallScore = Math.round(
      categories.reduce((acc, category) => acc + category.score, 0) / categories.length,
    );
    const confidence = computeConfidence(input.actionEvents.length, input.messageLogs.length);

    return {
      overallScore,
      confidence,
      categories,
      educationMessage: buildEducationMessage(categories),
      mode: "mock",
      modelUsed,
    };
  }

  private buildSystemPrompt() {
    return [
      "너는 모의 피싱 학습 세션 평가기다.",
      "목표는 사용자의 안전 대응 역량을 카테고리별 점수로 평가하는 것이다.",
      "반드시 JSON만 출력한다.",
      "categoryCode는 DETECT_SIGNAL, REFUSE_REQUEST, VERIFY_IDENTITY, REPORTING 중 하나만 사용한다.",
      "score는 0~100 정수, confidence는 0~1 소수로 제한한다.",
    ].join("\n");
  }

  private buildUserPrompt(input: EvaluatorInput) {
    const transcript = input.messageLogs
      .map(
        (line, idx) =>
          `${idx + 1}. [${line.speaker}] ${line.maskedText || line.text}`,
      )
      .join("\n");

    const actions = input.actionEvents
      .map(
        (event, idx) =>
          `${idx + 1}. type=${event.eventType}, action=${event.actionCode}, riskWeight=${event.riskWeight}, step=${event.stepNo ?? "N/A"}`,
      )
      .join("\n");

    return [
      `[promptVersion] ${input.promptVersion}`,
      `[scriptType] ${input.scriptType}`,
      `[script] ${input.scriptContent || "(empty)"}`,
      "[transcript]",
      transcript || "(no transcript)",
      "[actions]",
      actions || "(no actions)",
      "아래 JSON 스키마로만 응답:",
      JSON.stringify(
        {
          overallScore: 0,
          confidence: 0.8,
          categories: [
            {
              categoryCode: "DETECT_SIGNAL",
              score: 0,
              label: "A|B|C|D|E",
              evidence: ["근거1"],
              riskFlags: ["경고1"],
            },
          ],
          educationMessage: {
            summary: "요약",
            tips: ["팁1", "팁2"],
          },
        },
        null,
        2,
      ),
    ].join("\n");
  }

  private parseOpenAiResponse(payload: Record<string, unknown>) {
    const outputText = this.extractOutputText(payload);
    if (!outputText) {
      return null;
    }

    const jsonCandidate = this.extractJsonBlock(outputText);
    if (!jsonCandidate) {
      return null;
    }

    try {
      const parsed = JSON.parse(jsonCandidate) as {
        overallScore?: number;
        confidence?: number;
        categories?: Array<{
          categoryCode?: CategoryCode;
          score?: number;
          label?: string;
          evidence?: string[];
          riskFlags?: string[];
        }>;
        educationMessage?: {
          summary?: string;
          tips?: string[];
        };
      };

      if (!Array.isArray(parsed.categories) || parsed.categories.length === 0) {
        return null;
      }

      const categories = parsed.categories
        .filter((item) =>
          item.categoryCode &&
          Object.values(CategoryCode).includes(item.categoryCode) &&
          typeof item.score === "number",
        )
        .map((item) => ({
          categoryCode: item.categoryCode as CategoryCode,
          score: Math.max(0, Math.min(100, Math.round(item.score ?? 0))),
          label: item.label ?? "C",
          evidence: Array.isArray(item.evidence) ? item.evidence : [],
          riskFlags: Array.isArray(item.riskFlags) ? item.riskFlags : [],
        }));

      if (categories.length === 0) {
        return null;
      }

      const overallScore =
        typeof parsed.overallScore === "number"
          ? Math.max(0, Math.min(100, Math.round(parsed.overallScore)))
          : Math.round(categories.reduce((acc, item) => acc + item.score, 0) / categories.length);
      const confidence =
        typeof parsed.confidence === "number"
          ? Math.max(0, Math.min(1, parsed.confidence))
          : 0.7;

      return {
        overallScore,
        confidence,
        categories,
        educationMessage: {
          summary: parsed.educationMessage?.summary ?? "추가 학습이 필요합니다.",
          tips: Array.isArray(parsed.educationMessage?.tips)
            ? parsed.educationMessage.tips
            : ["의심 시 대화를 중단하고 공식 채널로 역확인하세요."],
        },
      };
    } catch {
      return null;
    }
  }

  private extractOutputText(payload: Record<string, unknown>) {
    if (typeof payload.output_text === "string") {
      return payload.output_text;
    }

    const output = payload.output;
    if (!Array.isArray(output)) {
      return null;
    }

    for (const block of output) {
      if (!block || typeof block !== "object") {
        continue;
      }
      const content = (block as { content?: unknown }).content;
      if (!Array.isArray(content)) {
        continue;
      }
      for (const item of content) {
        if (!item || typeof item !== "object") {
          continue;
        }
        const text = (item as { text?: unknown }).text;
        if (typeof text === "string" && text.trim()) {
          return text;
        }
      }
    }
    return null;
  }

  private extractJsonBlock(text: string) {
    const trimmed = text.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      return trimmed;
    }
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) {
      return null;
    }
    return trimmed.slice(start, end + 1);
  }
}
