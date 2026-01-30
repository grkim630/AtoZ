import { ConfigService } from "@nestjs/config";
import { AiMockService } from "../ai/ai-mock.service";
import { PrismaService } from "../prisma/prisma.service";
export declare class TtsService {
    private readonly prisma;
    private readonly aiMockService;
    private readonly configService;
    constructor(prisma: PrismaService, aiMockService: AiMockService, configService: ConfigService);
    createFromScript(scriptId: string): Promise<{
        id: string;
        createdAt: Date;
        storedPath: string;
        scriptId: string;
    }>;
    getById(id: string): Promise<{
        id: string;
        createdAt: Date;
        storedPath: string;
        scriptId: string;
    } | null>;
    listByUser(userId: string, filter?: {
        scriptId?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        storedPath: string;
        scriptId: string;
    }[]>;
    listAll(filter?: {
        scriptId?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        storedPath: string;
        scriptId: string;
    }[]>;
}
