import { PrismaService } from "../prisma/prisma.service";
import { CreateLogDto } from "./dto/create-log.dto";
export declare class LogsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createLog(userId: string, dto: CreateLogDto): Promise<{
        id: string;
        log: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        userId: string;
        scriptId: string;
        ttsFileId: string | null;
    }>;
    getById(id: string): Promise<{
        id: string;
        log: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        userId: string;
        scriptId: string;
        ttsFileId: string | null;
    } | null>;
    listByUser(userId: string): Promise<{
        id: string;
        log: import("@prisma/client/runtime/library").JsonValue;
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
        id: string;
        log: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        userId: string;
        scriptId: string;
        ttsFileId: string | null;
    }[]>;
}
