import { ExperienceService } from "./experience.service";
export declare class ExperienceController {
    private readonly experienceService;
    constructor(experienceService: ExperienceService);
    getScenario(keyword: string, type?: string): Promise<{
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
    }>;
}
