import { Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { ListTtsDto } from "./dto/list-tts.dto";
import { TtsService } from "./tts.service";

@Controller("tts")
export class TtsController {
  constructor(private readonly ttsService: TtsService) {}

  @UseGuards(JwtAuthGuard)
  @Post(":scriptId")
  async create(@Param("scriptId") scriptId: string) {
    return this.ttsService.createFromScript(scriptId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async listMine(
    @CurrentUser() user: { id: string },
    @Query() query: ListTtsDto,
  ) {
    return this.ttsService.listByUser(user.id, query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get("all")
  async listAll(@Query() query: ListTtsDto) {
    return this.ttsService.listAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(":id")
  async getById(@Param("id") id: string) {
    return this.ttsService.getById(id);
  }
}
