import { Prisma } from "@prisma/client";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateLogDto {
  @IsString()
  scriptId: string;

  @IsOptional()
  @IsString()
  ttsFileId?: string;

  @IsNotEmpty()
  log: Prisma.InputJsonValue;
}
