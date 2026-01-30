import { ListSummariesDto } from "./dto/list-summaries.dto";
import { SummariesService } from "./summaries.service";
export declare class SummariesController {
    private readonly summariesService;
    constructor(summariesService: SummariesService);
    create(extractedTextId: string): Promise<{
        summary: string;
        id: string;
        createdAt: Date;
        keywords: import("@prisma/client/runtime/library").JsonValue;
        extractedTextId: string;
    }>;
    listMine(user: {
        id: string;
    }, query: ListSummariesDto): Promise<{
        summary: string;
        id: string;
        createdAt: Date;
        keywords: import("@prisma/client/runtime/library").JsonValue;
        extractedTextId: string;
    }[]>;
    listAll(query: ListSummariesDto): Promise<{
        summary: string;
        id: string;
        createdAt: Date;
        keywords: import("@prisma/client/runtime/library").JsonValue;
        extractedTextId: string;
    }[]>;
    getById(id: string): Promise<{
        summary: string;
        id: string;
        createdAt: Date;
        keywords: import("@prisma/client/runtime/library").JsonValue;
        extractedTextId: string;
    } | null>;
}
