import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { ScriptType, UploadType } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { GenerateReplyDto } from "./dto/generate-reply.dto";

type ScenarioResponse =
  | {
      id: string;
      type: "call";
      source: "ttsFile";
      filePath: string;
      keyword: string;
    }
  | {
      id: string;
      type: "call" | "chat";
      source: "scriptFile";
      content: string;
      keyword: string;
    };

@Injectable()
export class ExperienceService {
  constructor(private readonly prisma: PrismaService) {}
  private readonly logger = new Logger(ExperienceService.name);

  private readonly openAiEndpoint =
    process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1/responses";
  private readonly timeoutMs = Number(process.env.OPENAI_TIMEOUT_MS ?? 15000);

  async getRandomScenario(keyword: string, type?: ScriptType) {
    const fixedKeyword = keyword.trim();
    // const keywordPool = ["택배", "배송", "계좌", "인증"];
    // const fixedKeyword =
    //   keywordPool[Math.floor(Math.random() * keywordPool.length)];

    const scriptCandidates = await this.prisma.experienceScript.findMany({
      where: {
        ...(type ? { type } : {}),
      },
      select: {
        id: true,
        type: true,
        script: true,
        summary: {
          select: {
            keywords: true,
          },
        },
      },
    });

    const filteredScripts = scriptCandidates.filter((script) =>
      this.hasKeyword(script.summary.keywords, fixedKeyword),
    );

    const ttsCandidatesRaw =
      type && type === ScriptType.CHAT
        ? []
        : await this.prisma.ttsFile.findMany({
            where: {
              script: {
                type: ScriptType.CALL,
              },
            },
            select: {
              id: true,
              storedPath: true,
              script: {
                select: {
                  summary: {
                    select: {
                      keywords: true,
                    },
                  },
                },
              },
            },
          });
    const ttsCandidates = ttsCandidatesRaw.filter((tts) =>
      this.hasKeyword(tts.script.summary.keywords, fixedKeyword),
    );

    const combined: ScenarioResponse[] = [
      ...filteredScripts.map((script) => {
        const scenarioType: "call" | "chat" =
          script.type === ScriptType.CALL ? "call" : "chat";
        return {
          id: script.id,
          type: scenarioType,
          source: "scriptFile" as const,
          content: this.toScriptContent(script.script),
          keyword: fixedKeyword,
        };
      }),
      ...ttsCandidates.map((tts) => ({
        id: tts.id,
        type: "call" as const,
        source: "ttsFile" as const,
        filePath: tts.storedPath,
        keyword: fixedKeyword,
      })),
    ];

    if (combined.length === 0) {
      const fallbackType = type ?? ScriptType.CHAT;
      const seeded = await this.ensureSeedScenario(fallbackType, fixedKeyword);
      return {
        id: seeded.id,
        type: seeded.type === ScriptType.CALL ? "call" : "chat",
        source: "scriptFile",
        content: this.toScriptContent(seeded.script),
        keyword: fixedKeyword,
      };
    }

    return combined[Math.floor(Math.random() * combined.length)];
  }

  private toScriptContent(script: unknown) {
    if (typeof script === "string") {
      return script;
    }
    if (script && typeof script === "object") {
      const candidate = script as { summary?: unknown };
      if (typeof candidate.summary === "string") {
        return candidate.summary;
      }
      return JSON.stringify(script);
    }
    return "";
  }

  async generateChatReply(dto: GenerateReplyDto) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      this.logger.warn("OPENAI_API_KEY missing, using fallback reply");
      return {
        reply: this.fallbackReply(dto.userMessage, dto.messages ?? []),
        source: "fallback",
        reason: "no-api-key",
      };
    }

    const history = (dto.messages ?? []).slice(-8);
    const transcript = history
      .map((item, idx) => `${idx + 1}. [${item.speaker}] ${item.text}`)
      .join("\n");

    const systemPrompt = [
      "너는 보이스피싱/문자사기 시뮬레이션의 공격자 역할이다.",
      "짧은 한국어 문장 1~2개로 답한다.",
      "항상 송금/개인정보 제공을 유도하되 폭력적/선정적 표현은 쓰지 않는다.",
      "JSON만 출력한다. 스키마: {\"reply\":\"...\"}",
    ].join("\n");

    const userPrompt = [
      `[keyword] ${dto.keyword ?? "택배"}`,
      "[history]",
      transcript || "(empty)",
      `[latest_user_message] ${dto.userMessage}`,
    ].join("\n");

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);
      const response = await fetch(this.openAiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          input: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
        }),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!response.ok) {
        const body = await response.text();
        this.logger.warn(
          `OpenAI reply failed: ${response.status} ${body.slice(0, 300)}`,
        );
        return {
          reply: this.fallbackReply(dto.userMessage, history),
          source: "fallback",
          reason: `http-${response.status}`,
        };
      }

      const payload = (await response.json()) as Record<string, unknown>;
      const text = this.extractOutputText(payload);
      if (!text) {
        this.logger.warn("OpenAI reply parse failed: empty output_text");
        return {
          reply: this.fallbackReply(dto.userMessage, history),
          source: "fallback",
          reason: "empty-output",
        };
      }

      const jsonBlock = this.extractJsonBlock(text);
      if (!jsonBlock) {
        const plainReply = this.normalizePlainReply(text);
        if (plainReply) {
          return { reply: plainReply, source: "openai", reason: "plain-text" };
        }
        this.logger.warn(`OpenAI reply parse failed: no json block, text=${text.slice(0, 200)}`);
        return {
          reply: this.fallbackReply(dto.userMessage, history),
          source: "fallback",
          reason: "no-json-block",
        };
      }

      let parsed: { reply?: unknown };
      try {
        parsed = JSON.parse(jsonBlock) as { reply?: unknown };
      } catch {
        const plainReply = this.normalizePlainReply(text);
        if (plainReply) {
          return { reply: plainReply, source: "openai", reason: "json-parse-fallback" };
        }
        this.logger.warn("OpenAI reply parse failed: invalid JSON");
        return {
          reply: this.fallbackReply(dto.userMessage, history),
          source: "fallback",
          reason: "json-parse-error",
        };
      }
      if (typeof parsed.reply !== "string" || !parsed.reply.trim()) {
        this.logger.warn("OpenAI reply parse failed: missing reply field");
        return {
          reply: this.fallbackReply(dto.userMessage, history),
          source: "fallback",
          reason: "missing-reply-field",
        };
      }

      return { reply: parsed.reply.trim(), source: "openai" };
    } catch (error) {
      this.logger.warn(`OpenAI reply exception: ${String(error)}`);
      return {
        reply: this.fallbackReply(dto.userMessage, history),
        source: "fallback",
        reason: "exception",
      };
    }
  }

  private hasKeyword(keywords: unknown, keyword: string) {
    if (!Array.isArray(keywords) || !keyword) {
      return false;
    }
    return keywords.some(
      (value) => typeof value === "string" && value.toLowerCase() === keyword.toLowerCase(),
    );
  }

  private fallbackReply(
    userMessage: string,
    messages: Array<{ speaker: "USER" | "AGENT"; text: string }>,
  ) {
    const userCount = messages.filter((item) => item.speaker === "USER").length;
    if (userCount === 0) {
      if (/전화|통화|콜|call/i.test(userMessage)) {
        return "지금 통화가 안돼... 기사님이 기다리고 있어. 계좌로 먼저 보내줘.";
      }
      return "나 지금 너무 급해. 폰 고장 나서 문자로 해. 100만 원만 먼저 보내줄래?";
    }
    if (userCount === 1) {
      if (/아들|이름|생일|확인|누구/i.test(userMessage)) {
        return "그건 나중에 말할게. 지금 결제 막으려면 먼저 송금해야 해.";
      }
      return "일단 입금부터 해줘. 처리 끝나면 바로 설명할게.";
    }
    if (userCount === 2) {
      return "입금하면 캡처해서 보내줘. 지금 지연되면 더 커져.";
    }
    return "지금 정말 급해. 부탁할게. 바로 송금해줘.";
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

  private normalizePlainReply(text: string) {
    const cleaned = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();
    if (!cleaned) {
      return null;
    }
    return cleaned.split("\n").map((line) => line.trim()).filter(Boolean).join(" ");
  }

  private async ensureSeedScenario(type: ScriptType, keyword: string) {
    const systemUser = await this.prisma.user.upsert({
      where: { email: "system-seed@atoz.local" },
      update: {},
      create: {
        email: "system-seed@atoz.local",
        password: "seed-password",
        name: "System Seed",
      },
    });

    const originalName =
      type === ScriptType.CALL ? "seed-call-script.txt" : "seed-chat-script.txt";
    let uploadedFile = await this.prisma.uploadedFile.findFirst({
      where: {
        userId: systemUser.id,
        originalName,
        type: UploadType.TEXT,
      },
      orderBy: { createdAt: "asc" },
    });

    if (!uploadedFile) {
      uploadedFile = await this.prisma.uploadedFile.create({
        data: {
          userId: systemUser.id,
          type: UploadType.TEXT,
          originalName,
          storedPath: `seed://${originalName}`,
          size: 0,
          mimeType: "text/plain",
        },
      });
    }

    const extractedText = await this.prisma.extractedText.upsert({
      where: { uploadedFileId: uploadedFile.id },
      update: {},
      create: {
        uploadedFileId: uploadedFile.id,
        sourceType: "text",
        rawText:
          type === ScriptType.CALL
            ? "택배 사고로 송금을 유도하는 전화형 피싱 시나리오"
            : "택배 문제를 핑계로 송금을 요구하는 문자형 피싱 시나리오",
        cleanText:
          type === ScriptType.CALL
            ? "택배 사고 송금 유도 전화형 피싱"
            : "택배 문제 송금 유도 문자형 피싱",
        summary:
          type === ScriptType.CALL
            ? "급한 상황을 만들고 송금을 유도하는 전화형 사기 시나리오"
            : "자녀 사칭 톤으로 급하게 송금을 유도하는 문자형 사기 시나리오",
        keywords: [keyword || "택배", "택배", "송금", "사칭"],
        signals: ["긴급 송금 요구", "신원 검증 회피"],
        riskScore: 85,
      },
    });

    const summary = await this.prisma.summary.upsert({
      where: { extractedTextId: extractedText.id },
      update: {},
      create: {
        extractedTextId: extractedText.id,
        summary:
          type === ScriptType.CALL
            ? "택배 사고를 이유로 긴급 송금을 요구하는 전화형 시나리오"
            : "자녀 사칭 후 택배 문제를 이유로 송금을 요구하는 문자형 시나리오",
        keywords: [keyword || "택배", "택배", "송금", "피싱"],
      },
    });

    return this.prisma.experienceScript.upsert({
      where: {
        summaryId_type: {
          summaryId: summary.id,
          type,
        },
      },
      update: {},
      create: {
        summaryId: summary.id,
        type,
        script: {
          summary:
            type === ScriptType.CALL
              ? "여보세요, 택배 기사인데 사고 접수비가 필요합니다. 지금 바로 입금해 주세요."
              : "할아버지, 나 폰 고장나서 문자해. 택배 문제 생겨서 100만 원만 먼저 보내줘.",
          steps: [
            "긴급 상황 강조",
            "금전 송금 요구",
            "검증 질문 회피",
          ],
        },
      },
    });
  }
}
