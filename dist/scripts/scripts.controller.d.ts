import { CreateScriptDto } from "./dto/create-script.dto";
import { ListScriptsDto } from "./dto/list-scripts.dto";
import { ScriptsService } from "./scripts.service";
export declare class ScriptsController {
    private readonly scriptsService;
    constructor(scriptsService: ScriptsService);
    create(summaryId: string, dto: CreateScriptDto): Promise<{
        id: string;
        createdAt: Date;
        type: import("@prisma/client").$Enums.ScriptType;
        summaryId: string;
        script: import("@prisma/client/runtime/library").JsonValue;
    }>;
    listMine(user: {
        id: string;
    }, query: ListScriptsDto): Promise<{
        id: string;
        createdAt: Date;
        type: import("@prisma/client").$Enums.ScriptType;
        summaryId: string;
        script: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
    listAll(query: ListScriptsDto): Promise<{
        id: string;
        createdAt: Date;
        type: import("@prisma/client").$Enums.ScriptType;
        summaryId: string;
        script: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
    getById(id: string): Promise<{
        id: string;
        createdAt: Date;
        type: import("@prisma/client").$Enums.ScriptType;
        summaryId: string;
        script: import("@prisma/client/runtime/library").JsonValue;
    } | null>;
}
