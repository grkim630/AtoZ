import { BadRequestException, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { UploadType } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class UploadsService implements OnModuleInit {
  private readonly logger = new Logger(UploadsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    const root = this.getUploadRoot();
    await fs.promises.mkdir(root, { recursive: true });
    await fs.promises.mkdir(path.join(root, "raw"), { recursive: true });
    await fs.promises.mkdir(path.join(root, "tts"), { recursive: true });
  }

  getUploadRoot() {
    return this.configService.get<string>("UPLOAD_DIR") ?? "uploads";
  }

  async createUploadedFile(params: {
    userId: string;
    type: UploadType;
    file: Express.Multer.File;
  }) {
    if (!params.file) {
      throw new BadRequestException("File is required");
    }

    this.logger.log(
      `Upload received: type=${params.type} originalName=${params.file.originalname} mime=${params.file.mimetype} size=${params.file.size} path=${params.file.path}`,
    );

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

  private async normalizeUpload(type: UploadType, file: Express.Multer.File) {
    const allowedByType: Record<UploadType, string[]> = {
      VOICE: ["audio/mpeg", "audio/mp3", "audio/mp4", "audio/x-m4a", "audio/wav"],
      IMAGE: ["image/jpeg", "image/jpg", "image/png"],
      TEXT: ["text/plain", "application/octet-stream"],
    };

    const allowedExtByType: Record<UploadType, string[]> = {
      VOICE: [".m4a", ".mp3", ".wav"],
      IMAGE: [".jpg", ".jpeg", ".png"],
      TEXT: [".txt"],
    };

    const mime = (file.mimetype || "").toLowerCase();
    const fileExt = path.extname(file.originalname || "").toLowerCase();

    const mimeAllowed =
      allowedByType[type].includes(mime) || mime === "application/octet-stream";
    const extAllowed = fileExt ? allowedExtByType[type].includes(fileExt) : true;

    if (!mimeAllowed || !extAllowed) {
      this.logger.warn(
        `Upload rejected: type=${type} originalName=${file.originalname} mime=${mime}`,
      );
      throw new BadRequestException("Unsupported file type");
    }

    const extFallbackByType: Record<UploadType, string> = {
      VOICE: ".m4a",
      IMAGE: ".png",
      TEXT: ".txt",
    };

    const mimeToExt: Record<string, string> = {
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
      this.logger.log(
        `Upload normalized: originalName=${file.originalname} newPath=${newPath}`,
      );
      return { storedPath: newPath };
    }

    return { storedPath: file.path };
  }

  async getUploadedFile(id: string) {
    return this.prisma.uploadedFile.findUnique({ where: { id } });
  }

  async listByUser(userId: string, filter?: { type?: UploadType }) {
    return this.prisma.uploadedFile.findMany({
      where: {
        userId,
        ...(filter?.type ? { type: filter.type } : {}),
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async listAll(filter?: { type?: UploadType }) {
    return this.prisma.uploadedFile.findMany({
      where: {
        ...(filter?.type ? { type: filter.type } : {}),
      },
      orderBy: { createdAt: "desc" },
    });
  }
}
