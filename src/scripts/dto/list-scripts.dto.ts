import { IsEnum, IsOptional, IsString } from "class-validator";
import { ScriptType } from "@prisma/client";

export class ListScriptsDto {
  @IsOptional()
  @IsString()
  summaryId?: string;

  @IsOptional()
  @IsEnum(ScriptType)
  type?: ScriptType;
}
