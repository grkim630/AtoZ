import { IsEnum, IsOptional } from 'class-validator';
import { UploadType } from '@prisma/client';

export class ListUploadsDto {
  @IsOptional()
  @IsEnum(UploadType)
  type?: UploadType;
}
