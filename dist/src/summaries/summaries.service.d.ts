import { PrismaService } from "../prisma/prisma.service";
export declare class SummariesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createFromExtractedText(extractedTextId: string): Promise<{
        id: string;
        summary: string;
        keywords: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        extractedTextId: string;
    }>;
    getById(id: string): Promise<{
        id: string;
        summary: string;
        keywords: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        extractedTextId: string;
    } | null>;
    listByUser(userId: string, filter?: {
        extractedTextId?: string;
    }): Promise<{
        id: string;
        summary: string;
        keywords: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        extractedTextId: string;
    }[]>;
    listAll(filter?: {
        extractedTextId?: string;
    }): Promise<{
        id: string;
        summary: string;
        keywords: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        extractedTextId: string;
    }[]>;
}
