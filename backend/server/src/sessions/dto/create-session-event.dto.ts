import { ActionEventType } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateSessionEventDto {
  @IsEnum(ActionEventType)
  eventType: ActionEventType;

  @IsString()
  actionCode: string;

  @IsNumber()
  @Min(-1)
  @Max(1)
  riskWeight: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  stepNo?: number;

  @IsOptional()
  @IsISO8601()
  timestamp?: string;
}
