import { CreateLogDto } from "./dto/create-log.dto";
import { ListLogsDto } from "./dto/list-logs.dto";
import { LogsService } from "./logs.service";
export declare class LogsController {
    private readonly logsService;
    constructor(logsService: LogsService);
    create(user: {
        id: string;
    }, dto: CreateLogDto): Promise<{
        log: import("@prisma/client/runtime/library").JsonValue;
        id: string;
        createdAt: Date;
        userId: string;
        scriptId: string;
        ttsFileId: string | null;
    }>;
    listMine(user: {
        id: string;
    }): Promise<{
        log: import("@prisma/client/runtime/library").JsonValue;
        id: string;
        createdAt: Date;
        userId: string;
        scriptId: string;
        ttsFileId: string | null;
    }[]>;
    listAll(query: ListLogsDto): Promise<{
        log: import("@prisma/client/runtime/library").JsonValue;
        id: string;
        createdAt: Date;
        userId: string;
        scriptId: string;
        ttsFileId: string | null;
    }[]>;
    getById(id: string): Promise<{
        log: import("@prisma/client/runtime/library").JsonValue;
        id: string;
        createdAt: Date;
        userId: string;
        scriptId: string;
        ttsFileId: string | null;
    } | null>;
}
