import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { ListExtractedTextDto } from './dto/list-extracted-text.dto';
import { ExtractedTextService } from './extracted-text.service';

@Controller('extracted-text')
export class ExtractedTextController {
  constructor(private readonly extractedTextService: ExtractedTextService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':uploadedFileId')
  async create(@Param('uploadedFileId') uploadedFileId: string) {
    return this.extractedTextService.createFromUpload(uploadedFileId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async listMine(
    @CurrentUser() user: { id: string },
    @Query() query: ListExtractedTextDto,
  ) {
    return this.extractedTextService.listByUser(user.id, query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('all')
  async listAll(@Query() query: ListExtractedTextDto) {
    return this.extractedTextService.listAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('experience')
  async getExperience(@Query('keyword') keyword: string) {
    if (!keyword) {
      throw new BadRequestException('keyword is required');
    }
    return this.extractedTextService.getRandomExperienceByKeyword(keyword);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/analysis')
  async getAnalysis(@Param('id') id: string) {
    return this.extractedTextService.getAnalysisById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.extractedTextService.getById(id);
  }
}
