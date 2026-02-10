import { ScriptType } from '@prisma/client';
import {
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { PHISHING_TYPES } from '../model/phishing-taxonomy';

export class RunAnalysisPipelineDto {
  @IsUUID()
  uploadedFileId: string;

  @IsOptional()
  @IsEnum(ScriptType)
  scriptType?: ScriptType;

  @IsOptional()
  @IsString()
  @IsIn(PHISHING_TYPES)
  expectedType?: (typeof PHISHING_TYPES)[number];

  @IsOptional()
  @IsString()
  @MinLength(5)
  script?: string;
}
