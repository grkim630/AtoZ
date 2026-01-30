import { IsOptional, IsString } from "class-validator";

export class ListLogsDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  scriptId?: string;

  @IsOptional()
  @IsString()
  ttsFileId?: string;
}
