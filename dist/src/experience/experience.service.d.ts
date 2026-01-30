import { ScriptType } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
type ScenarioResponse = {
    id: string;
    type: "call";
    source: "ttsFile";
    filePath: string;
    keyword: string;
} | {
    id: string;
    type: "call" | "chat";
    source: "scriptFile";
    content: string;
    keyword: string;
};
export declare class ExperienceService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getRandomScenario(keyword: string, type?: ScriptType): Promise<ScenarioResponse>;
    private toScriptContent;
}
export {};
