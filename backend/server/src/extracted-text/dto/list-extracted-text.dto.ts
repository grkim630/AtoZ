import { IsOptional, IsString } from 'class-validator';

export class ListExtractedTextDto {
  @IsOptional()
  @IsString()
  uploadedFileId?: string;
}
