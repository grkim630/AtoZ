"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiMockService = void 0;
const common_1 = require("@nestjs/common");
let AiMockService = class AiMockService {
    speechToText(filePath) {
        return `MOCK_STT: ${filePath}`;
    }
    ocrImage(filePath) {
        return `MOCK_OCR: ${filePath}`;
    }
    cleanText(text) {
        return text.replace(/\s+/g, " ").trim();
    }
    summarize(text) {
        const summary = text.length > 120 ? `${text.slice(0, 120)}...` : text;
        const keywords = Array.from(new Set(text
            .split(/\s+/)
            .filter((token) => token.length >= 4)
            .slice(0, 10)));
        return { summary, keywords };
    }
    generateScript(type, summary, keywords) {
        if (type === "CALL") {
            return {
                type: "CALL",
                opening: "안녕하세요 고객님, 확인할 내용이 있습니다.",
                summary,
                keywords,
                steps: [
                    "본인 확인을 위해 간단한 정보를 요청합니다.",
                    "문제가 발생했다며 긴급 조치를 유도합니다.",
                    "보안 앱 설치 또는 송금을 요구합니다.",
                ],
            };
        }
        return {
            type: "CHAT",
            summary,
            keywords,
            messages: [
                { from: "attacker", text: "안녕하세요, 확인할 사항이 있습니다." },
                { from: "victim", text: "무슨 일이죠?" },
                { from: "attacker", text: "계정 문제가 있어 링크를 눌러주세요." },
            ],
        };
    }
    textToSpeech(script) {
        return `MOCK_TTS: ${script}`;
    }
};
exports.AiMockService = AiMockService;
exports.AiMockService = AiMockService = __decorate([
    (0, common_1.Injectable)()
], AiMockService);
//# sourceMappingURL=ai-mock.service.js.map