"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TtsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_1 = require("@prisma/client");
const ai_mock_service_1 = require("../ai/ai-mock.service");
const prisma_service_1 = require("../prisma/prisma.service");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let TtsService = class TtsService {
    prisma;
    aiMockService;
    configService;
    constructor(prisma, aiMockService, configService) {
        this.prisma = prisma;
        this.aiMockService = aiMockService;
        this.configService = configService;
    }
    async createFromScript(scriptId) {
        const script = await this.prisma.experienceScript.findUnique({
            where: { id: scriptId },
        });
        if (!script) {
            throw new common_1.BadRequestException("Script not found");
        }
        if (script.type !== client_1.ScriptType.CALL) {
            throw new common_1.BadRequestException("TTS is only available for CALL scripts");
        }
        const existing = await this.prisma.ttsFile.findUnique({
            where: { scriptId },
        });
        if (existing) {
            throw new common_1.BadRequestException("TTS already exists");
        }
        const ttsContent = this.aiMockService.textToSpeech(JSON.stringify(script.script));
        const root = this.configService.get("UPLOAD_DIR") ?? "uploads";
        const ttsDir = path.join(root, "tts");
        await fs.promises.mkdir(ttsDir, { recursive: true });
        const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.txt`;
        const storedPath = path.join(ttsDir, filename);
        await fs.promises.writeFile(storedPath, ttsContent, "utf-8");
        return this.prisma.ttsFile.create({
            data: {
                scriptId: script.id,
                storedPath,
            },
        });
    }
    async getById(id) {
        return this.prisma.ttsFile.findUnique({ where: { id } });
    }
    async listByUser(userId, filter) {
        return this.prisma.ttsFile.findMany({
            where: {
                ...(filter?.scriptId ? { scriptId: filter.scriptId } : {}),
                script: {
                    summary: {
                        extractedText: {
                            uploadedFile: { userId },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
    }
    async listAll(filter) {
        return this.prisma.ttsFile.findMany({
            where: {
                ...(filter?.scriptId ? { scriptId: filter.scriptId } : {}),
            },
            orderBy: { createdAt: "desc" },
        });
    }
};
exports.TtsService = TtsService;
exports.TtsService = TtsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_mock_service_1.AiMockService,
        config_1.ConfigService])
], TtsService);
//# sourceMappingURL=tts.service.js.map