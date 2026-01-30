import { Prisma } from "@prisma/client";
export declare class CreateLogDto {
    scriptId: string;
    ttsFileId?: string;
    log: Prisma.InputJsonValue;
}
