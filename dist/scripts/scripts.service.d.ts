import { ScriptType } from "@prisma/client";
import { AiMockService } from "../ai/ai-mock.service";
import { PrismaService } from "../prisma/prisma.service";
export declare class ScriptsService {
    private readonly prisma;
    private readonly aiMockService;
    constructor(prisma: PrismaService, aiMockService: AiMockService);
    createFromSummary(summaryId: string, type: ScriptType): Promise<{
        id: string;
        createdAt: Date;
        type: import("@prisma/client").$Enums.ScriptType;
        summaryId: string;
        script: import("@prisma/client/runtime/library").JsonValue;
    }>;
    getById(id: string): Promise<{
        id: string;
        createdAt: Date;
        type: import("@prisma/client").$Enums.ScriptType;
        summaryId: string;
        script: import("@prisma/client/runtime/library").JsonValue;
    } | null>;
    listByUser(userId: string, filter?: {
        summaryId?: string;
        type?: ScriptType;
    }): Promise<{
        id: string;
        createdAt: Date;
        type: import("@prisma/client").$Enums.ScriptType;
        summaryId: string;
        script: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
    listAll(filter?: {
        summaryId?: string;
        type?: ScriptType;
    }): Promise<{
        id: string;
        createdAt: Date;
        type: import("@prisma/client").$Enums.ScriptType;
        summaryId: string;
        script: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
}
