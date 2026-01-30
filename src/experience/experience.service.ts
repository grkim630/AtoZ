import { Injectable, NotFoundException } from "@nestjs/common";
import { ScriptType } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

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

  async getRandomScenario(keyword: string, type?: ScriptType) {
    const fixedKeyword = "택배";
    // const fixedKeyword = keyword;
    // const keywordPool = ["택배", "배송", "계좌", "인증"];
    // const fixedKeyword =
    //   keywordPool[Math.floor(Math.random() * keywordPool.length)];

    const scriptCandidates = await this.prisma.experienceScript.findMany({
      where: {
        summary: {
          keywords: {
            array_contains: [fixedKeyword],
          },
        },
        ...(type ? { type } : {}),
      },
      select: {
        id: true,
        type: true,
        script: true,
      },
    });

    const ttsCandidates =
      type && type === ScriptType.CHAT
        ? []
        : await this.prisma.ttsFile.findMany({
            where: {
              script: {
                type: ScriptType.CALL,
                summary: {
                  keywords: {
                    array_contains: [fixedKeyword],
                  },
                },
              },
            },
            select: {
              id: true,
              storedPath: true,
            },
          });

    const combined: ScenarioResponse[] = [
      ...scriptCandidates.map((script) => {
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
      throw new NotFoundException("No scenario found for keyword");
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
}
