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
var UploadsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let UploadsService = UploadsService_1 = class UploadsService {
    prisma;
    configService;
    logger = new common_1.Logger(UploadsService_1.name);
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
    }
    async onModuleInit() {
        const root = this.getUploadRoot();
        await fs.promises.mkdir(root, { recursive: true });
        await fs.promises.mkdir(path.join(root, "raw"), { recursive: true });
        await fs.promises.mkdir(path.join(root, "tts"), { recursive: true });
    }
    getUploadRoot() {
        return this.configService.get("UPLOAD_DIR") ?? "uploads";
    }
    async createUploadedFile(params) {
        if (!params.file) {
            throw new common_1.BadRequestException("File is required");
        }
        this.logger.log(`Upload received: type=${params.type} originalName=${params.file.originalname} mime=${params.file.mimetype} size=${params.file.size} path=${params.file.path}`);
        const normalized = await this.normalizeUpload(params.type, params.file);
        return this.prisma.uploadedFile.create({
            data: {
                userId: params.userId,
                type: params.type,
                originalName: params.file.originalname,
                storedPath: normalized.storedPath,
                size: params.file.size,
                mimeType: params.file.mimetype,
            },
        });
    }
    async normalizeUpload(type, file) {
        const allowedByType = {
            VOICE: ["audio/mpeg", "audio/mp3", "audio/mp4", "audio/x-m4a", "audio/wav"],
            IMAGE: ["image/jpeg", "image/jpg", "image/png"],
            TEXT: ["text/plain", "application/octet-stream"],
        };
        const allowedExtByType = {
            VOICE: [".m4a", ".mp3", ".wav"],
            IMAGE: [".jpg", ".jpeg", ".png"],
            TEXT: [".txt"],
        };
        const mime = (file.mimetype || "").toLowerCase();
        const fileExt = path.extname(file.originalname || "").toLowerCase();
        const mimeAllowed = allowedByType[type].includes(mime) || mime === "application/octet-stream";
        const extAllowed = fileExt ? allowedExtByType[type].includes(fileExt) : true;
        if (!mimeAllowed || !extAllowed) {
            this.logger.warn(`Upload rejected: type=${type} originalName=${file.originalname} mime=${mime}`);
            throw new common_1.BadRequestException("Unsupported file type");
        }
        const extFallbackByType = {
            VOICE: ".m4a",
            IMAGE: ".png",
            TEXT: ".txt",
        };
        const mimeToExt = {
            "audio/mpeg": ".mp3",
            "audio/mp3": ".mp3",
            "audio/mp4": ".m4a",
            "audio/x-m4a": ".m4a",
            "audio/wav": ".wav",
            "image/jpeg": ".jpg",
            "image/jpg": ".jpg",
            "image/png": ".png",
            "text/plain": ".txt",
        };
        if (!fileExt) {
            const inferredExt = mimeToExt[mime] || extFallbackByType[type];
            const newPath = `${file.path}${inferredExt}`;
            await fs.promises.rename(file.path, newPath);
            this.logger.log(`Upload normalized: originalName=${file.originalname} newPath=${newPath}`);
            return { storedPath: newPath };
        }
        return { storedPath: file.path };
    }
    async getUploadedFile(id) {
        return this.prisma.uploadedFile.findUnique({ where: { id } });
    }
    async listByUser(userId, filter) {
        return this.prisma.uploadedFile.findMany({
            where: {
                userId,
                ...(filter?.type ? { type: filter.type } : {}),
            },
            orderBy: { createdAt: "desc" },
        });
    }
    async listAll(filter) {
        return this.prisma.uploadedFile.findMany({
            where: {
                ...(filter?.type ? { type: filter.type } : {}),
            },
            orderBy: { createdAt: "desc" },
        });
    }
};
exports.UploadsService = UploadsService;
exports.UploadsService = UploadsService = UploadsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], UploadsService);
//# sourceMappingURL=uploads.service.js.map