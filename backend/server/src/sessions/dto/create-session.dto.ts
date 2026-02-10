import { SessionChannel } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateSessionDto {
  @IsString()
  scriptId: string;

  @IsEnum(SessionChannel)
  channel: SessionChannel;

  @IsOptional()
  @IsInt()
  @Min(1)
  scriptVersion?: number;

  @IsOptional()
  @IsString()
  llmModelVersion?: string;
}
