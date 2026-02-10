import { MessageSpeaker } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateSessionMessageDto {
  @IsInt()
  @Min(0)
  turnIndex: number;

  @IsEnum(MessageSpeaker)
  speaker: MessageSpeaker;

  @IsString()
  text: string;

  @IsOptional()
  @IsString()
  maskedText?: string;

  @IsOptional()
  @IsISO8601()
  timestamp?: string;
}
