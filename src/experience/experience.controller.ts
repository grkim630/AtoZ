import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ScriptType } from "@prisma/client";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ExperienceService } from "./experience.service";

@Controller("experience")
export class ExperienceController {
  constructor(private readonly experienceService: ExperienceService) {}

  @UseGuards(JwtAuthGuard)
  @Get("scenario")
  async getScenario(
    @Query("keyword") keyword: string,
    @Query("type") type?: string,
  ) {
    if (!keyword) {
      throw new BadRequestException("keyword is required");
    }

    let parsedType: ScriptType | undefined;
    if (type) {
      const normalized = type.toLowerCase();
      if (normalized === "call") {
        parsedType = ScriptType.CALL;
      } else if (normalized === "chat") {
        parsedType = ScriptType.CHAT;
      } else {
        throw new BadRequestException("type must be call or chat");
      }
    }

    return this.experienceService.getRandomScenario(keyword, parsedType);
  }
}
