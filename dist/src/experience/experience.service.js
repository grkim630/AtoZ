"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExperienceService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let ExperienceService = class ExperienceService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getRandomScenario(keyword, type) {
        const fixedKeyword = "택배";
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
        const ttsCandidates = type && type === client_1.ScriptType.CHAT
            ? []
            : await this.prisma.ttsFile.findMany({
                where: {
                    script: {
                        type: client_1.ScriptType.CALL,
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
        const combined = [
            ...scriptCandidates.map((script) => {
                const scenarioType = script.type === client_1.ScriptType.CALL ? "call" : "chat";
                return {
                    id: script.id,
                    type: scenarioType,
                    source: "scriptFile",
                    content: this.toScriptContent(script.script),
                    keyword: fixedKeyword,
                };
            }),
            ...ttsCandidates.map((tts) => ({
                id: tts.id,
                type: "call",
                source: "ttsFile",
                filePath: tts.storedPath,
                keyword: fixedKeyword,
            })),
        ];
        if (combined.length === 0) {
            throw new common_1.NotFoundException("No scenario found for keyword");
        }
        return combined[Math.floor(Math.random() * combined.length)];
    }
    toScriptContent(script) {
        if (typeof script === "string") {
            return script;
        }
        if (script && typeof script === "object") {
            const candidate = script;
            if (typeof candidate.summary === "string") {
                return candidate.summary;
            }
            return JSON.stringify(script);
        }
        return "";
    }
};
exports.ExperienceService = ExperienceService;
exports.ExperienceService = ExperienceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExperienceService);
//# sourceMappingURL=experience.service.js.map