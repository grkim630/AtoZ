import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateLogDto } from "./dto/create-log.dto";

@Injectable()
export class LogsService {
  constructor(private readonly prisma: PrismaService) {}

  async createLog(userId: string, dto: CreateLogDto) {
    const script = await this.prisma.experienceScript.findUnique({
      where: { id: dto.scriptId },
    });
    if (!script) {
      throw new BadRequestException("Script not found");
    }

    if (dto.ttsFileId) {
      const tts = await this.prisma.ttsFile.findUnique({
        where: { id: dto.ttsFileId },
      });
      if (!tts || tts.scriptId !== script.id) {
        throw new BadRequestException("Invalid TTS file");
      }
    }

    return this.prisma.experienceLog.create({
      data: {
        userId,
        scriptId: script.id,
        ttsFileId: dto.ttsFileId ?? null,
        log: dto.log,
      },
    });
  }

  async getById(id: string) {
    return this.prisma.experienceLog.findUnique({ where: { id } });
  }

  async listByUser(userId: string) {
    return this.prisma.experienceLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async listAll(filter?: { userId?: string; scriptId?: string; ttsFileId?: string }) {
    return this.prisma.experienceLog.findMany({
      where: {
        ...(filter?.userId ? { userId: filter.userId } : {}),
        ...(filter?.scriptId ? { scriptId: filter.scriptId } : {}),
        ...(filter?.ttsFileId ? { ttsFileId: filter.ttsFileId } : {}),
      },
      orderBy: { createdAt: "desc" },
    });
  }
}
