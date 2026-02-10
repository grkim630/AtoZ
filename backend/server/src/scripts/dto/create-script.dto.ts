import { IsEnum } from 'class-validator';
import { ScriptType } from '@prisma/client';

export class CreateScriptDto {
  @IsEnum(ScriptType)
  type: ScriptType;
}
