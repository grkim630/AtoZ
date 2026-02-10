import { IsOptional, IsString } from 'class-validator';

export class EvaluateSessionDto {
  @IsOptional()
  @IsString()
  promptVersion?: string;

  @IsOptional()
  @IsString()
  model?: string;
}
