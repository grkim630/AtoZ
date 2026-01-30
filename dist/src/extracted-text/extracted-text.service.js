"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ExtractedTextService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtractedTextService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const child_process_1 = require("child_process");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const util_1 = require("util");
const execFileAsync = (0, util_1.promisify)(child_process_1.execFile);
let ExtractedTextService = ExtractedTextService_1 = class ExtractedTextService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    logger = new common_1.Logger(ExtractedTextService_1.name);
    pythonInlineCode = [
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
    getPythonExecutable() {
        const projectRoot = this.getProjectRoot();
        const envPath = process.env.EXTRACTED_TEXT_PYTHON ?? process.env.PYTHON_EXTRACTOR_PATH;
        const venvRoot = path.resolve(projectRoot, "extracted-text-py", ".venv");
        const windowsPython = path.join(venvRoot, "Scripts", "python.exe");
        const posixPython = path.join(venvRoot, "bin", "python");
        const allowedPaths = [windowsPython, posixPython].map((candidate) => path.normalize(candidate).toLowerCase());
        if (envPath) {
            if (!path.isAbsolute(envPath)) {
                throw new common_1.InternalServerErrorException("EXTRACTED_TEXT_PYTHON must be an absolute path to venv python");
            }
            const normalizedEnvPath = path.normalize(envPath).toLowerCase();
            if (!allowedPaths.includes(normalizedEnvPath)) {
                throw new common_1.InternalServerErrorException("System Python is blocked. Use extracted-text-py/.venv python only.");
            }
            if (!fs.existsSync(envPath)) {
                throw new common_1.InternalServerErrorException("Python executable not found at configured path");
            }
            return envPath;
        }
        if (fs.existsSync(windowsPython)) {
            return windowsPython;
        }
        if (fs.existsSync(posixPython)) {
            return posixPython;
        }
        throw new common_1.InternalServerErrorException("Python venv executable not found. Create extracted-text-py/.venv first.");
    }
    getProjectRoot() {
        return path.resolve(__dirname, "..", "..");
    }
    getPythonWorkingDir() {
        return path.resolve(this.getProjectRoot(), "extracted-text-py");
    }
    resolveAbsolutePath(filePath) {
        if (path.isAbsolute(filePath)) {
            return filePath;
        }
        return path.resolve(this.getProjectRoot(), filePath);
    }
    async verifyPythonEnvironment(pythonExec, pythonCwd, env) {
        let pythonVersion = "";
        try {
            const { stdout, stderr } = await execFileAsync(pythonExec, ["--version"], { cwd: pythonCwd, env });
            pythonVersion = (stdout || stderr).trim();
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(`Python runtime check failed (version): ${this.formatExecError(error)}`);
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
        let probe;
        try {
            const { stdout } = await execFileAsync(pythonExec, ["-c", probeCode], {
                cwd: pythonCwd,
                env,
            });
            probe = JSON.parse(stdout.trim());
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(`Python runtime check failed (OpenAI SDK): ${this.formatExecError(error)}`);
        }
        this.logger.log(`Python exec resolved: ${pythonExec}`);
        this.logger.log(`Python version: ${pythonVersion}`);
        this.logger.log(`OpenAI SDK version: ${probe.openai_version}, responses API: ${probe.has_responses}`);
        if (!probe.has_responses) {
            throw new common_1.InternalServerErrorException(`Python runtime check failed: OpenAI SDK missing responses API (openai=${probe.openai_version}, python=${probe.python_version}). Ensure venv python is used.`);
        }
    }
    formatExecError(error) {
        if (!error || typeof error !== "object") {
            return "unknown error";
        }
        const err = error;
        return [err.message, err.stderr, err.stdout].filter(Boolean).join(" | ");
    }
    async runExtractionEngine(filePath, sourceType) {
        const pythonCwd = this.getPythonWorkingDir();
        if (!fs.existsSync(pythonCwd)) {
            throw new common_1.InternalServerErrorException("Python module directory not found");
        }
        const absoluteFilePath = this.resolveAbsolutePath(filePath);
        if (!fs.existsSync(absoluteFilePath)) {
            throw new common_1.BadRequestException("Input file not found");
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
        return await new Promise((resolve, reject) => {
            const child = (0, child_process_1.spawn)(pythonExec, ["-c", this.pythonInlineCode, absoluteFilePath, sourceType], { cwd: pythonCwd, env });
            let stdout = "";
            let stderr = "";
            child.stdout.on("data", (chunk) => {
                stdout += chunk.toString();
            });
            child.stderr.on("data", (chunk) => {
                stderr += chunk.toString();
            });
            child.on("error", (error) => {
                reject(new common_1.InternalServerErrorException(`Python process error: ${error.message}`));
            });
            child.on("close", (code) => {
                if (code !== 0) {
                    reject(new common_1.InternalServerErrorException(`Python process failed (${pythonExec}): ${stderr || "unknown error"}`));
                    return;
                }
                try {
                    const parsed = JSON.parse(stdout.trim());
                    resolve(parsed);
                }
                catch (error) {
                    reject(new common_1.InternalServerErrorException("Failed to parse Python output JSON"));
                }
            });
        });
    }
    async createFromUpload(uploadedFileId) {
        const uploadedFile = await this.prisma.uploadedFile.findUnique({
            where: { id: uploadedFileId },
        });
        if (!uploadedFile) {
            throw new common_1.BadRequestException("Uploaded file not found");
        }
        const existing = await this.prisma.extractedText.findUnique({
            where: { uploadedFileId },
        });
        if (existing) {
            throw new common_1.BadRequestException("Extracted text already exists");
        }
        let sourceType;
        if (uploadedFile.type === client_1.UploadType.TEXT) {
            sourceType = "text";
        }
        else if (uploadedFile.type === client_1.UploadType.VOICE) {
            sourceType = "audio";
        }
        else {
            sourceType = "image";
        }
        const extraction = await this.runExtractionEngine(uploadedFile.storedPath, sourceType);
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
    async getById(id) {
        return this.prisma.extractedText.findUnique({ where: { id } });
    }
    async getAnalysisById(id) {
        return this.prisma.extractedText.findUnique({
            where: { id },
            select: {
                keywords: true,
                signals: true,
                riskScore: true,
            },
        });
    }
    async getRandomExperienceByKeyword(keyword) {
        const fixedKeyword = "택배";
        const candidates = await this.prisma.extractedText.findMany({
            where: {
                keywords: {
                    array_contains: [fixedKeyword],
                },
            },
            select: {
                id: true,
                summary: true,
                keywords: true,
                riskScore: true,
                sourceType: true,
            },
        });
        if (candidates.length === 0) {
            throw new common_1.NotFoundException("No extracted text found for keyword");
        }
        const picked = candidates[Math.floor(Math.random() * candidates.length)];
        const keywords = Array.isArray(picked.keywords)
            ? picked.keywords
            : [];
        return {
            id: picked.id,
            summary: picked.summary,
            keywords,
            riskScore: picked.riskScore,
            type: picked.sourceType,
        };
    }
    async listByUser(userId, filter) {
        return this.prisma.extractedText.findMany({
            where: {
                ...(filter?.uploadedFileId ? { uploadedFileId: filter.uploadedFileId } : {}),
                uploadedFile: { userId },
            },
            orderBy: { createdAt: "desc" },
        });
    }
    async listAll(filter) {
        return this.prisma.extractedText.findMany({
            where: {
                ...(filter?.uploadedFileId ? { uploadedFileId: filter.uploadedFileId } : {}),
            },
            orderBy: { createdAt: "desc" },
        });
    }
};
exports.ExtractedTextService = ExtractedTextService;
exports.ExtractedTextService = ExtractedTextService = ExtractedTextService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExtractedTextService);
//# sourceMappingURL=extracted-text.service.js.map