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
exports.ScriptsService = void 0;
const common_1 = require("@nestjs/common");
const ai_mock_service_1 = require("../ai/ai-mock.service");
const prisma_service_1 = require("../prisma/prisma.service");
let ScriptsService = class ScriptsService {
    prisma;
    aiMockService;
    constructor(prisma, aiMockService) {
        this.prisma = prisma;
        this.aiMockService = aiMockService;
    }
    async createFromSummary(summaryId, type) {
        const summary = await this.prisma.summary.findUnique({
            where: { id: summaryId },
        });
        if (!summary) {
            throw new common_1.BadRequestException("Summary not found");
        }
        const existing = await this.prisma.experienceScript.findFirst({
            where: { summaryId, type },
        });
        if (existing) {
            throw new common_1.BadRequestException("Script for this type already exists");
        }
        const keywords = Array.isArray(summary.keywords)
            ? summary.keywords
            : [];
        const script = this.aiMockService.generateScript(type, summary.summary, keywords);
        return this.prisma.experienceScript.create({
            data: {
                summaryId: summary.id,
                type,
                script,
            },
        });
    }
    async getById(id) {
        return this.prisma.experienceScript.findUnique({ where: { id } });
    }
    async listByUser(userId, filter) {
        return this.prisma.experienceScript.findMany({
            where: {
                ...(filter?.summaryId ? { summaryId: filter.summaryId } : {}),
                ...(filter?.type ? { type: filter.type } : {}),
                summary: {
                    extractedText: {
                        uploadedFile: {
                            userId,
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
    }
    async listAll(filter) {
        return this.prisma.experienceScript.findMany({
            where: {
                ...(filter?.summaryId ? { summaryId: filter.summaryId } : {}),
                ...(filter?.type ? { type: filter.type } : {}),
            },
            orderBy: { createdAt: "desc" },
        });
    }
};
exports.ScriptsService = ScriptsService;
exports.ScriptsService = ScriptsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_mock_service_1.AiMockService])
], ScriptsService);
//# sourceMappingURL=scripts.service.js.map