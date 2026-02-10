import { Injectable } from '@nestjs/common';
import { ScriptType } from '@prisma/client';

@Injectable()
export class AiMockService {
  speechToText(filePath: string) {
    return `MOCK_STT: ${filePath}`;
  }

  ocrImage(filePath: string) {
    return `MOCK_OCR: ${filePath}`;
  }

  cleanText(text: string) {
    return text.replace(/\s+/g, ' ').trim();
  }

  summarize(text: string) {
    const summary = text.length > 120 ? `${text.slice(0, 120)}...` : text;
    const keywords = Array.from(
      new Set(
        text
          .split(/\s+/)
          .filter((token) => token.length >= 4)
          .slice(0, 10),
      ),
    );
    return { summary, keywords };
  }

  generateScript(type: ScriptType, summary: string, keywords: string[]) {
    if (type === 'CALL') {
      return {
        type: 'CALL',
        opening: '안녕하세요 고객님, 확인할 내용이 있습니다.',
        summary,
        keywords,
        steps: [
          '본인 확인을 위해 간단한 정보를 요청합니다.',
          '문제가 발생했다며 긴급 조치를 유도합니다.',
          '보안 앱 설치 또는 송금을 요구합니다.',
        ],
      };
    }

    return {
      type: 'CHAT',
      summary,
      keywords,
      messages: [
        { from: 'attacker', text: '안녕하세요, 확인할 사항이 있습니다.' },
        { from: 'victim', text: '무슨 일이죠?' },
        { from: 'attacker', text: '계정 문제가 있어 링크를 눌러주세요.' },
      ],
    };
  }

  textToSpeech(script: string) {
    return `MOCK_TTS: ${script}`;
  }
}
