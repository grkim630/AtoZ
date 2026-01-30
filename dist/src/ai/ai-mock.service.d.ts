import { ScriptType } from "@prisma/client";
export declare class AiMockService {
    speechToText(filePath: string): string;
    ocrImage(filePath: string): string;
    cleanText(text: string): string;
    summarize(text: string): {
        summary: string;
        keywords: string[];
    };
    generateScript(type: ScriptType, summary: string, keywords: string[]): {
        type: string;
        opening: string;
        summary: string;
        keywords: string[];
        steps: string[];
        messages?: undefined;
    } | {
        type: string;
        summary: string;
        keywords: string[];
        messages: {
            from: string;
            text: string;
        }[];
        opening?: undefined;
        steps?: undefined;
    };
    textToSpeech(script: string): string;
}
