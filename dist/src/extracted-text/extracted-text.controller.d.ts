import { ListExtractedTextDto } from "./dto/list-extracted-text.dto";
import { ExtractedTextService } from "./extracted-text.service";
export declare class ExtractedTextController {
    private readonly extractedTextService;
    constructor(extractedTextService: ExtractedTextService);
    create(uploadedFileId: string): Promise<{
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
    listMine(user: {
        id: string;
    }, query: ListExtractedTextDto): Promise<{
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
    listAll(query: ListExtractedTextDto): Promise<{
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
    getExperience(keyword: string): Promise<{
        id: string;
        summary: string;
        keywords: string[];
        riskScore: number;
        type: string;
    }>;
    getAnalysis(id: string): Promise<{
        keywords: import("@prisma/client/runtime/library").JsonValue;
        signals: import("@prisma/client/runtime/library").JsonValue;
        riskScore: number;
    } | null>;
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
}
