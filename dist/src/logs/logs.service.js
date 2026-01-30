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
exports.LogsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let LogsService = class LogsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createLog(userId, dto) {
        const script = await this.prisma.experienceScript.findUnique({
            where: { id: dto.scriptId },
        });
        if (!script) {
            throw new common_1.BadRequestException("Script not found");
        }
        if (dto.ttsFileId) {
            const tts = await this.prisma.ttsFile.findUnique({
                where: { id: dto.ttsFileId },
            });
            if (!tts || tts.scriptId !== script.id) {
                throw new common_1.BadRequestException("Invalid TTS file");
            }
        }
        return this.prisma.experienceLog.create({
            data: {
                userId,
                scriptId: script.id,
                ttsFileId: dto.ttsFileId ?? null,
                log: dto.log,
            },
        });
    }
    async getById(id) {
        return this.prisma.experienceLog.findUnique({ where: { id } });
    }
    async listByUser(userId) {
        return this.prisma.experienceLog.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
    }
    async listAll(filter) {
        return this.prisma.experienceLog.findMany({
            where: {
                ...(filter?.userId ? { userId: filter.userId } : {}),
                ...(filter?.scriptId ? { scriptId: filter.scriptId } : {}),
                ...(filter?.ttsFileId ? { ttsFileId: filter.ttsFileId } : {}),
            },
            orderBy: { createdAt: "desc" },
        });
    }
};
exports.LogsService = LogsService;
exports.LogsService = LogsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LogsService);
//# sourceMappingURL=logs.service.js.map