import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { CreateScriptDto } from "./dto/create-script.dto";
import { ListScriptsDto } from "./dto/list-scripts.dto";
import { ScriptsService } from "./scripts.service";

@Controller("scripts")
export class ScriptsController {
  constructor(private readonly scriptsService: ScriptsService) {}

  @UseGuards(JwtAuthGuard)
  @Post(":summaryId")
  async create(
    @Param("summaryId") summaryId: string,
    @Body() dto: CreateScriptDto,
  ) {
    return this.scriptsService.createFromSummary(summaryId, dto.type);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async listMine(
    @CurrentUser() user: { id: string },
    @Query() query: ListScriptsDto,
  ) {
    return this.scriptsService.listByUser(user.id, query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get("all")
  async listAll(@Query() query: ListScriptsDto) {
    return this.scriptsService.listAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(":id")
  async getById(@Param("id") id: string) {
    return this.scriptsService.getById(id);
  }
}
