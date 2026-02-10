import { Prisma } from '@prisma/client';
import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';

export class SubmitSessionSurveyDto {
  @IsNotEmpty()
  answersJson: Prisma.InputJsonValue;

  @IsOptional()
  @IsBoolean()
  isSkipped?: boolean;
}
