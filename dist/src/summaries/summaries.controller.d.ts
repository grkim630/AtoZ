import { ListSummariesDto } from "./dto/list-summaries.dto";
import { SummariesService } from "./summaries.service";
export declare class SummariesController {
    private readonly summariesService;
    constructor(summariesService: SummariesService);
    create(extractedTextId: string): Promise<{
        id: string;
        summary: string;
        keywords: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        extractedTextId: string;
    }>;
    listMine(user: {
        id: string;
    }, query: ListSummariesDto): Promise<{
        id: string;
        summary: string;
        keywords: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        extractedTextId: string;
    }[]>;
    listAll(query: ListSummariesDto): Promise<{
        id: string;
        summary: string;
        keywords: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        extractedTextId: string;
    }[]>;
    getById(id: string): Promise<{
        id: string;
        summary: string;
        keywords: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        extractedTextId: string;
    } | null>;
}
