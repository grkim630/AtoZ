import { FeedbackQualityFlag, Prisma } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class IngestLlmFeedbackDto {
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @IsOptional()
  inputFeaturesJson?: Prisma.InputJsonValue;

  @IsOptional()
  targetLabelJson?: Prisma.InputJsonValue;

  @IsOptional()
  @IsEnum(FeedbackQualityFlag)
  qualityFlag?: FeedbackQualityFlag;

  @IsOptional()
  @IsString()
  reviewerId?: string;
}
