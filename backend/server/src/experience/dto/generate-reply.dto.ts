import {
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ChatMessageDto {
  @IsString()
  @IsIn(['USER', 'AGENT'])
  speaker: 'USER' | 'AGENT';

  @IsString()
  @MaxLength(1000)
  text: string;
}

export class GenerateReplyDto {
  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsString()
  @MaxLength(1000)
  userMessage: string;

  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  messages?: ChatMessageDto[];
}
