import { ScriptType } from "@prisma/client";
import { AiMockService } from "../ai/ai-mock.service";
import { PrismaService } from "../prisma/prisma.service";
export declare class ScriptsService {
    private readonly prisma;
    private readonly aiMockService;
    constructor(prisma: PrismaService, aiMockService: AiMockService);
    createFromSummary(summaryId: string, type: ScriptType): Promise<{
        id: string;
        script: import("@prisma/client/runtime/library").JsonValue;
        type: import("@prisma/client").$Enums.ScriptType;
        createdAt: Date;
        summaryId: string;
    }>;
    getById(id: string): Promise<{
        id: string;
        script: import("@prisma/client/runtime/library").JsonValue;
        type: import("@prisma/client").$Enums.ScriptType;
        createdAt: Date;
        summaryId: string;
    } | null>;
    listByUser(userId: string, filter?: {
        summaryId?: string;
        type?: ScriptType;
    }): Promise<{
        id: string;
        script: import("@prisma/client/runtime/library").JsonValue;
        type: import("@prisma/client").$Enums.ScriptType;
        createdAt: Date;
        summaryId: string;
    }[]>;
    listAll(filter?: {
        summaryId?: string;
        type?: ScriptType;
    }): Promise<{
        id: string;
        script: import("@prisma/client/runtime/library").JsonValue;
        type: import("@prisma/client").$Enums.ScriptType;
        createdAt: Date;
        summaryId: string;
    }[]>;
}
