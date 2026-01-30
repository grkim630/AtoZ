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
exports.SummariesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SummariesService = class SummariesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createFromExtractedText(extractedTextId) {
        const extractedText = await this.prisma.extractedText.findUnique({
            where: { id: extractedTextId },
        });
        if (!extractedText) {
            throw new common_1.BadRequestException("Extracted text not found");
        }
        const existing = await this.prisma.summary.findUnique({
            where: { extractedTextId },
        });
        if (existing) {
            throw new common_1.BadRequestException("Summary already exists");
        }
        const keywords = Array.isArray(extractedText.keywords)
            ? extractedText.keywords
            : [];
        const summary = extractedText.summary || "";
        return this.prisma.summary.create({
            data: {
                extractedTextId: extractedText.id,
                summary,
                keywords,
            },
        });
    }
    async getById(id) {
        return this.prisma.summary.findUnique({ where: { id } });
    }
    async listByUser(userId, filter) {
        return this.prisma.summary.findMany({
            where: {
                ...(filter?.extractedTextId
                    ? { extractedTextId: filter.extractedTextId }
                    : {}),
                extractedText: {
                    uploadedFile: { userId },
                },
            },
            orderBy: { createdAt: "desc" },
        });
    }
    async listAll(filter) {
        return this.prisma.summary.findMany({
            where: {
                ...(filter?.extractedTextId
                    ? { extractedTextId: filter.extractedTextId }
                    : {}),
            },
            orderBy: { createdAt: "desc" },
        });
    }
};
exports.SummariesService = SummariesService;
exports.SummariesService = SummariesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SummariesService);
//# sourceMappingURL=summaries.service.js.map