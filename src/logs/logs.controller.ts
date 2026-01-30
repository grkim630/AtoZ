import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { CreateLogDto } from "./dto/create-log.dto";
import { ListLogsDto } from "./dto/list-logs.dto";
import { LogsService } from "./logs.service";

@Controller("logs")
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateLogDto,
  ) {
    return this.logsService.createLog(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  async listMine(@CurrentUser() user: { id: string }) {
    return this.logsService.listByUser(user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get("all")
  async listAll(@Query() query: ListLogsDto) {
    return this.logsService.listAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(":id")
  async getById(@Param("id") id: string) {
    return this.logsService.getById(id);
  }
}
