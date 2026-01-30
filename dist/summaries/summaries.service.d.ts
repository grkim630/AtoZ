import { PrismaService } from "../prisma/prisma.service";
export declare class SummariesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createFromExtractedText(extractedTextId: string): Promise<{
        summary: string;
        id: string;
        createdAt: Date;
        keywords: import("@prisma/client/runtime/library").JsonValue;
        extractedTextId: string;
    }>;
    getById(id: string): Promise<{
        summary: string;
        id: string;
        createdAt: Date;
        keywords: import("@prisma/client/runtime/library").JsonValue;
        extractedTextId: string;
    } | null>;
    listByUser(userId: string, filter?: {
        extractedTextId?: string;
    }): Promise<{
        summary: string;
        id: string;
        createdAt: Date;
        keywords: import("@prisma/client/runtime/library").JsonValue;
        extractedTextId: string;
    }[]>;
    listAll(filter?: {
        extractedTextId?: string;
    }): Promise<{
        summary: string;
        id: string;
        createdAt: Date;
        keywords: import("@prisma/client/runtime/library").JsonValue;
        extractedTextId: string;
    }[]>;
}
