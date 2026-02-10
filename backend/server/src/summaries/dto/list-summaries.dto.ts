import { IsOptional, IsString } from 'class-validator';

export class ListSummariesDto {
  @IsOptional()
  @IsString()
  extractedTextId?: string;
}
