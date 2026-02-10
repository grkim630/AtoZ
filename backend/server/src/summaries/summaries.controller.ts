import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { ListSummariesDto } from './dto/list-summaries.dto';
import { SummariesService } from './summaries.service';

@Controller('summaries')
export class SummariesController {
  constructor(private readonly summariesService: SummariesService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':extractedTextId')
  async create(@Param('extractedTextId') extractedTextId: string) {
    return this.summariesService.createFromExtractedText(extractedTextId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async listMine(
    @CurrentUser() user: { id: string },
    @Query() query: ListSummariesDto,
  ) {
    return this.summariesService.listByUser(user.id, query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('all')
  async listAll(@Query() query: ListSummariesDto) {
    return this.summariesService.listAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.summariesService.getById(id);
  }
}
