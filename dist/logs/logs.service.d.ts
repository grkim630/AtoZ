import { PrismaService } from "../prisma/prisma.service";
import { CreateLogDto } from "./dto/create-log.dto";
export declare class LogsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createLog(userId: string, dto: CreateLogDto): Promise<{
        log: import("@prisma/client/runtime/library").JsonValue;
        id: string;
        createdAt: Date;
        userId: string;
        scriptId: string;
        ttsFileId: string | null;
    }>;
    getById(id: string): Promise<{
        log: import("@prisma/client/runtime/library").JsonValue;
        id: string;
        createdAt: Date;
        userId: string;
        scriptId: string;
        ttsFileId: string | null;
    } | null>;
    listByUser(userId: string): Promise<{
        log: import("@prisma/client/runtime/library").JsonValue;
        id: string;
        createdAt: Date;
        userId: string;
        scriptId: string;
        ttsFileId: string | null;
    }[]>;
    listAll(filter?: {
        userId?: string;
        scriptId?: string;
        ttsFileId?: string;
    }): Promise<{
        log: import("@prisma/client/runtime/library").JsonValue;
        id: string;
        createdAt: Date;
        userId: string;
        scriptId: string;
        ttsFileId: string | null;
    }[]>;
}
