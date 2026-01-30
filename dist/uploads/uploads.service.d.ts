import { OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { UploadType } from "@prisma/client";
export declare class UploadsService implements OnModuleInit {
    private readonly prisma;
    private readonly configService;
    private readonly logger;
    constructor(prisma: PrismaService, configService: ConfigService);
    onModuleInit(): Promise<void>;
    getUploadRoot(): string;
    createUploadedFile(params: {
        userId: string;
        type: UploadType;
        file: Express.Multer.File;
    }): Promise<{
        id: string;
        createdAt: Date;
        type: import("@prisma/client").$Enums.UploadType;
        originalName: string;
        storedPath: string;
        size: number;
        mimeType: string;
        userId: string;
    }>;
    private normalizeUpload;
    getUploadedFile(id: string): Promise<{
        id: string;
        createdAt: Date;
        type: import("@prisma/client").$Enums.UploadType;
        originalName: string;
        storedPath: string;
        size: number;
        mimeType: string;
        userId: string;
    } | null>;
    listByUser(userId: string, filter?: {
        type?: UploadType;
    }): Promise<{
        id: string;
        createdAt: Date;
        type: import("@prisma/client").$Enums.UploadType;
        originalName: string;
        storedPath: string;
        size: number;
        mimeType: string;
        userId: string;
    }[]>;
    listAll(filter?: {
        type?: UploadType;
    }): Promise<{
        id: string;
        createdAt: Date;
        type: import("@prisma/client").$Enums.UploadType;
        originalName: string;
        storedPath: string;
        size: number;
        mimeType: string;
        userId: string;
    }[]>;
}
