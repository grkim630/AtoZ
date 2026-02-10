import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

type KobertEvalResult = {
  cleanText: string;
  label: 'phishing' | 'normal';
  riskScore: number;
};

@Injectable()
export class KobertEvaluationModel {
  private readonly logger = new Logger(KobertEvaluationModel.name);

  private readonly pythonInlineCode = [
    'import json, os, sys',
    'from preprocess.text_clean import preprocess_text',
    'from inference.predictor import predict_risk',
    "text = (sys.argv[1] or '').strip()",
    'if not text:',
    "    raise ValueError('text is required')",
    'clean_text = preprocess_text(text)',
    'out = predict_risk(clean_text)',
    'payload = {',
    "  'cleanText': clean_text,",
    "  'label': out.get('label', 'normal'),",
    "  'riskScore': float(out.get('risk_score', 0.0)),",
    '}',
    'print(json.dumps(payload, ensure_ascii=False))',
  ].join('\n');

  private getProjectRoot() {
    return path.resolve(__dirname, '..', '..', '..');
  }

  private getPythonProjectRoot() {
    return path.resolve(this.getProjectRoot(), '..', 'python', 'evaluation');
  }

  private getPythonExecutable() {
    const envPath = process.env.EVALUATION_PYTHON;
    if (envPath) {
      if (!path.isAbsolute(envPath)) {
        throw new InternalServerErrorException(
          'EVALUATION_PYTHON must be an absolute path',
        );
      }
      if (!fs.existsSync(envPath)) {
        throw new InternalServerErrorException(
          'Python executable not found at EVALUATION_PYTHON',
        );
      }
      return envPath;
    }

    const venvRoot = path.resolve(this.getPythonProjectRoot(), '.venv');
    const windowsPython = path.join(venvRoot, 'Scripts', 'python.exe');
    const posixPython = path.join(venvRoot, 'bin', 'python');
    if (fs.existsSync(windowsPython)) {
      return windowsPython;
    }
    if (fs.existsSync(posixPython)) {
      return posixPython;
    }

    throw new InternalServerErrorException(
      'Python venv executable not found for evaluation (.venv)',
    );
  }

  async evaluateText(text: string): Promise<KobertEvalResult> {
    if (!text?.trim()) {
      throw new BadRequestException('text is required');
    }

    const pythonCwd = this.getPythonProjectRoot();
    if (!fs.existsSync(pythonCwd)) {
      throw new InternalServerErrorException(
        'Python evaluation directory not found',
      );
    }

    const pythonExec = this.getPythonExecutable();
    const env = {
      ...process.env,
      PYTHONIOENCODING: 'utf-8',
      PYTHONUNBUFFERED: '1',
      PYTHONPATH: [pythonCwd, process.env.PYTHONPATH]
        .filter(Boolean)
        .join(path.delimiter),
    };

    return await new Promise<KobertEvalResult>((resolve, reject) => {
      // child_process를 선택한 이유:
      // 기존 extracted-text 모듈이 동일한 방식으로 Python을 호출하고 있으며,
      // 서버 간 HTTP 의존성을 추가하지 않고 배포 복잡도를 줄일 수 있기 때문입니다.
      const child = spawn(pythonExec, ['-c', this.pythonInlineCode, text], {
        cwd: pythonCwd,
        env,
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (chunk) => {
        stdout += chunk.toString();
      });

      child.stderr.on('data', (chunk) => {
        stderr += chunk.toString();
      });

      child.on('error', (error) => {
        reject(
          new InternalServerErrorException(
            `Python process error: ${error.message}`,
          ),
        );
      });

      child.on('close', (code) => {
        if (code !== 0) {
          this.logger.error(`Python evaluate failed: ${stderr}`);
          reject(
            new InternalServerErrorException(
              `Python evaluate failed (${code}): ${stderr || 'unknown error'}`,
            ),
          );
          return;
        }

        try {
          const parsed = JSON.parse(stdout.trim()) as KobertEvalResult;
          resolve({
            cleanText: parsed.cleanText ?? text.trim(),
            label: parsed.label === 'phishing' ? 'phishing' : 'normal',
            riskScore: Number(parsed.riskScore ?? 0),
          });
        } catch {
          reject(
            new InternalServerErrorException(
              'Failed to parse Python evaluate JSON',
            ),
          );
        }
      });
    });
  }
}
