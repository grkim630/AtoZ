import { CreateScriptDto } from "./dto/create-script.dto";
import { ListScriptsDto } from "./dto/list-scripts.dto";
import { ScriptsService } from "./scripts.service";
export declare class ScriptsController {
    private readonly scriptsService;
    constructor(scriptsService: ScriptsService);
    create(summaryId: string, dto: CreateScriptDto): Promise<{
        id: string;
        script: import("@prisma/client/runtime/library").JsonValue;
        type: import("@prisma/client").$Enums.ScriptType;
        createdAt: Date;
        summaryId: string;
    }>;
    listMine(user: {
        id: string;
    }, query: ListScriptsDto): Promise<{
        id: string;
        script: import("@prisma/client/runtime/library").JsonValue;
        type: import("@prisma/client").$Enums.ScriptType;
        createdAt: Date;
        summaryId: string;
    }[]>;
    listAll(query: ListScriptsDto): Promise<{
        id: string;
        script: import("@prisma/client/runtime/library").JsonValue;
        type: import("@prisma/client").$Enums.ScriptType;
        createdAt: Date;
        summaryId: string;
    }[]>;
    getById(id: string): Promise<{
        id: string;
        script: import("@prisma/client/runtime/library").JsonValue;
        type: import("@prisma/client").$Enums.ScriptType;
        createdAt: Date;
        summaryId: string;
    } | null>;
}
