import { IsEnum } from 'class-validator';
import { UploadType } from '@prisma/client';

export class UploadFileDto {
  @IsEnum(UploadType)
  type: UploadType;
}
