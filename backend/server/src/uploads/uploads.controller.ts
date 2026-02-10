import {
  Body,
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { ListUploadsDto } from './dto/list-uploads.dto';
import { UploadFileDto } from './dto/upload-file.dto';
import { UploadsService } from './uploads.service';

@Controller('uploads')
export class UploadsController {
  private readonly logger = new Logger(UploadsController.name);

  constructor(private readonly uploadsService: UploadsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @CurrentUser() user: { id: string },
    @Body() dto: UploadFileDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      this.logger.warn(
        `Upload missing file: userId=${user.id} type=${dto?.type ?? 'unknown'}`,
      );
      throw new BadRequestException('File is required');
    }
    return this.uploadsService.createUploadedFile({
      userId: user.id,
      type: dto.type,
      file,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async listMine(
    @CurrentUser() user: { id: string },
    @Query() query: ListUploadsDto,
  ) {
    return this.uploadsService.listByUser(user.id, query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('all')
  async listAll(@Query() query: ListUploadsDto) {
    return this.uploadsService.listAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.uploadsService.getUploadedFile(id);
  }
}
