import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { UploadType } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { execFile, spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

@Injectable()
export class ExtractedTextService {
  constructor(private readonly prisma: PrismaService) {}
  private readonly logger = new Logger(ExtractedTextService.name);

  private readonly pythonInlineCode = [
    "import json, os, sys",
    "from app.main import analyze_pipeline",
    "from app.services_stt import stt_transcribe",
    "from app.services_ocr import ocr_extract_text",
    "file_path = sys.argv[1]",
    "source_type = sys.argv[2]",
    "if source_type == 'text':",
    "    with open(file_path, 'r', encoding='utf-8') as f:",
    "        raw_text = f.read()",
    "elif source_type == 'audio':",
    "    with open(file_path, 'rb') as f:",
    "        raw_text = stt_transcribe(f.read(), os.path.basename(file_path))",
    "elif source_type == 'image':",
    "    with open(file_path, 'rb') as f:",
    "        raw_text = ocr_extract_text(f.read())",
    "else:",
    "    raise ValueError('Unsupported source type: ' + source_type)",
    "result = analyze_pipeline(source_type, raw_text)",
    "print(json.dumps(result.model_dump(), ensure_ascii=False))",
  ].join("\n");

  private getPythonExecutable() {
    const projectRoot = this.getProjectRoot();
    const envPath =
      process.env.EXTRACTED_TEXT_PYTHON ?? process.env.PYTHON_EXTRACTOR_PATH;
    const venvRoot = path.resolve(projectRoot, "extracted-text-py", ".venv");
    const windowsPython = path.join(venvRoot, "Scripts", "python.exe");
    const posixPython = path.join(venvRoot, "bin", "python");
    const allowedPaths = [windowsPython, posixPython].map((candidate) =>
      path.normalize(candidate).toLowerCase(),
    );

    if (envPath) {
      if (!path.isAbsolute(envPath)) {
        throw new InternalServerErrorException(
          "EXTRACTED_TEXT_PYTHON must be an absolute path to venv python",
        );
      }
      const normalizedEnvPath = path.normalize(envPath).toLowerCase();
      if (!allowedPaths.includes(normalizedEnvPath)) {
        throw new InternalServerErrorException(
          "System Python is blocked. Use extracted-text-py/.venv python only.",
        );
      }
      if (!fs.existsSync(envPath)) {
        throw new InternalServerErrorException(
          "Python executable not found at configured path",
        );
      }
      return envPath;
    }

    if (fs.existsSync(windowsPython)) {
      return windowsPython;
    }
    if (fs.existsSync(posixPython)) {
      return posixPython;
    }

    throw new InternalServerErrorException(
      "Python venv executable not found. Create extracted-text-py/.venv first.",
    );
  }

  private getProjectRoot() {
    return path.resolve(__dirname, "..", "..");
  }

  private getPythonWorkingDir() {
    return path.resolve(this.getProjectRoot(), "extracted-text-py");
  }

  private resolveAbsolutePath(filePath: string) {
    if (path.isAbsolute(filePath)) {
      return filePath;
    }
    return path.resolve(this.getProjectRoot(), filePath);
  }

  private async verifyPythonEnvironment(
    pythonExec: string,
    pythonCwd: string,
    env: NodeJS.ProcessEnv,
  ) {
    let pythonVersion = "";
    try {
      const { stdout, stderr } = await execFileAsync(
        pythonExec,
        ["--version"],
        { cwd: pythonCwd, env },
      );
      pythonVersion = (stdout || stderr).trim();
    } catch (error) {
      throw new InternalServerErrorException(
        `Python runtime check failed (version): ${this.formatExecError(error)}`,
      );
    }

    const probeCode = [
      "import json, sys",
      "import openai",
      "from openai import OpenAI",
      "client = OpenAI(api_key='test')",
      "print(json.dumps({",
      "  'python_version': sys.version.split()[0],",
      "  'openai_version': getattr(openai, '__version__', 'unknown'),",
      "  'has_responses': hasattr(client, 'responses'),",
      "}, ensure_ascii=False))",
    ].join("\n");

    let probe: { python_version: string; openai_version: string; has_responses: boolean };
    try {
      const { stdout } = await execFileAsync(pythonExec, ["-c", probeCode], {
        cwd: pythonCwd,
        env,
      });
      probe = JSON.parse(stdout.trim());
    } catch (error) {
      throw new InternalServerErrorException(
        `Python runtime check failed (OpenAI SDK): ${this.formatExecError(error)}`,
      );
    }

    this.logger.log(`Python exec resolved: ${pythonExec}`);
    this.logger.log(`Python version: ${pythonVersion}`);
    this.logger.log(
      `OpenAI SDK version: ${probe.openai_version}, responses API: ${probe.has_responses}`,
    );

    if (!probe.has_responses) {
      throw new InternalServerErrorException(
        `Python runtime check failed: OpenAI SDK missing responses API (openai=${probe.openai_version}, python=${probe.python_version}). Ensure venv python is used.`,
      );
    }
  }

  private formatExecError(error: unknown) {
    if (!error || typeof error !== "object") {
      return "unknown error";
    }
    const err = error as { message?: string; stdout?: string; stderr?: string };
    return [err.message, err.stderr, err.stdout].filter(Boolean).join(" | ");
  }

  private async runExtractionEngine(
    filePath: string,
    sourceType: "audio" | "image" | "text",
  ) {
    const pythonCwd = this.getPythonWorkingDir();
    if (!fs.existsSync(pythonCwd)) {
      throw new InternalServerErrorException(
        "Python module directory not found",
      );
    }

    const absoluteFilePath = this.resolveAbsolutePath(filePath);
    if (!fs.existsSync(absoluteFilePath)) {
      throw new BadRequestException("Input file not found");
    }

    const pythonExec = this.getPythonExecutable();

    const env = {
      ...process.env,
      PYTHONIOENCODING: "utf-8",
      PYTHONUNBUFFERED: "1",
      PYTHONPATH: [pythonCwd, process.env.PYTHONPATH]
        .filter(Boolean)
        .join(path.delimiter),
    };

    await this.verifyPythonEnvironment(pythonExec, pythonCwd, env);

    return await new Promise<{
      sourceType: "audio" | "image" | "text";
      rawText: string;
      cleanText: string;
      summary: string;
      keywords: string[];
      signals: string[];
      riskScore: number;
    }>((resolve, reject) => {
      const child = spawn(
        pythonExec,
        ["-c", this.pythonInlineCode, absoluteFilePath, sourceType],
        { cwd: pythonCwd, env },
      );

      let stdout = "";
      let stderr = "";

      child.stdout.on("data", (chunk) => {
        stdout += chunk.toString();
      });

      child.stderr.on("data", (chunk) => {
        stderr += chunk.toString();
      });

      child.on("error", (error) => {
        reject(
          new InternalServerErrorException(
            `Python process error: ${error.message}`,
          ),
        );
      });

      child.on("close", (code) => {
        if (code !== 0) {
          reject(
            new InternalServerErrorException(
              `Python process failed (${pythonExec}): ${stderr || "unknown error"}`,
            ),
          );
          return;
        }

        try {
          const parsed = JSON.parse(stdout.trim());
          resolve(parsed);
        } catch (error) {
          reject(
            new InternalServerErrorException(
              "Failed to parse Python output JSON",
            ),
          );
        }
      });
    });
  }

  async createFromUpload(uploadedFileId: string) {
    const uploadedFile = await this.prisma.uploadedFile.findUnique({
      where: { id: uploadedFileId },
    });
    if (!uploadedFile) {
      throw new BadRequestException("Uploaded file not found");
    }

    const existing = await this.prisma.extractedText.findUnique({
      where: { uploadedFileId },
    });
    if (existing) {
      throw new BadRequestException("Extracted text already exists");
    }

    let sourceType: "audio" | "image" | "text";
    if (uploadedFile.type === UploadType.TEXT) {
      sourceType = "text";
    } else if (uploadedFile.type === UploadType.VOICE) {
      sourceType = "audio";
    } else {
      sourceType = "image";
    }

    const extraction = await this.runExtractionEngine(
      uploadedFile.storedPath,
      sourceType,
    );

    return this.prisma.extractedText.create({
      data: {
        uploadedFileId: uploadedFile.id,
        sourceType: extraction.sourceType ?? sourceType,
        rawText: extraction.rawText ?? "",
        cleanText: extraction.cleanText ?? "",
        summary: extraction.summary ?? "",
        keywords: extraction.keywords ?? [],
        signals: extraction.signals ?? [],
        riskScore: extraction.riskScore ?? 0,
      },
    });
  }

  async getById(id: string) {
    return this.prisma.extractedText.findUnique({ where: { id } });
  }

  async getAnalysisById(id: string) {
    return this.prisma.extractedText.findUnique({
      where: { id },
      select: {
        keywords: true,
        signals: true,
        riskScore: true,
      },
    });
  }

  async getRandomExperienceByKeyword(keyword: string) {
    const fixedKeyword = keyword.trim();
    // const keywordPool = ["택배", "배송", "계좌", "인증"];
    // const fixedKeyword =
    //   keywordPool[Math.floor(Math.random() * keywordPool.length)];

    const candidates = await this.prisma.extractedText.findMany({
      select: {
        id: true,
        summary: true,
        keywords: true,
        riskScore: true,
        sourceType: true,
      },
    });
    const filteredCandidates = candidates.filter((item) =>
      this.hasKeyword(item.keywords, fixedKeyword),
    );

    if (filteredCandidates.length === 0) {
      throw new NotFoundException("No extracted text found for keyword");
    }

    const picked =
      filteredCandidates[Math.floor(Math.random() * filteredCandidates.length)];
    const keywords = Array.isArray(picked.keywords)
      ? (picked.keywords as string[])
      : [];

    return {
      id: picked.id,
      summary: picked.summary,
      keywords,
      riskScore: picked.riskScore,
      type: picked.sourceType,
    };
  }

  async listByUser(
    userId: string,
    filter?: { uploadedFileId?: string },
  ) {
    return this.prisma.extractedText.findMany({
      where: {
        ...(filter?.uploadedFileId ? { uploadedFileId: filter.uploadedFileId } : {}),
        uploadedFile: { userId },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async listAll(filter?: { uploadedFileId?: string }) {
    return this.prisma.extractedText.findMany({
      where: {
        ...(filter?.uploadedFileId ? { uploadedFileId: filter.uploadedFileId } : {}),
      },
      orderBy: { createdAt: "desc" },
    });
  }

  private hasKeyword(keywords: unknown, keyword: string) {
    if (!Array.isArray(keywords) || !keyword) {
      return false;
    }
    return keywords.some(
      (value) => typeof value === "string" && value.toLowerCase() === keyword.toLowerCase(),
    );
  }
}
