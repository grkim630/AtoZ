import { PrismaService } from "../prisma/prisma.service";
export declare class ExtractedTextService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private readonly logger;
    private readonly pythonInlineCode;
    private getPythonExecutable;
    private getProjectRoot;
    private getPythonWorkingDir;
    private resolveAbsolutePath;
    private verifyPythonEnvironment;
    private formatExecError;
    private runExtractionEngine;
    createFromUpload(uploadedFileId: string): Promise<{
        id: string;
        summary: string;
        keywords: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        uploadedFileId: string;
        sourceType: string;
        rawText: string;
        cleanText: string;
        signals: import("@prisma/client/runtime/library").JsonValue;
        riskScore: number;
    }>;
    getById(id: string): Promise<{
        id: string;
        summary: string;
        keywords: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        uploadedFileId: string;
        sourceType: string;
        rawText: string;
        cleanText: string;
        signals: import("@prisma/client/runtime/library").JsonValue;
        riskScore: number;
    } | null>;
    getAnalysisById(id: string): Promise<{
        keywords: import("@prisma/client/runtime/library").JsonValue;
        signals: import("@prisma/client/runtime/library").JsonValue;
        riskScore: number;
    } | null>;
    getRandomExperienceByKeyword(keyword: string): Promise<{
        id: string;
        summary: string;
        keywords: string[];
        riskScore: number;
        type: string;
    }>;
    listByUser(userId: string, filter?: {
        uploadedFileId?: string;
    }): Promise<{
        id: string;
        summary: string;
        keywords: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        uploadedFileId: string;
        sourceType: string;
        rawText: string;
        cleanText: string;
        signals: import("@prisma/client/runtime/library").JsonValue;
        riskScore: number;
    }[]>;
    listAll(filter?: {
        uploadedFileId?: string;
    }): Promise<{
        id: string;
        summary: string;
        keywords: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        uploadedFileId: string;
        sourceType: string;
        rawText: string;
        cleanText: string;
        signals: import("@prisma/client/runtime/library").JsonValue;
        riskScore: number;
    }[]>;
}
