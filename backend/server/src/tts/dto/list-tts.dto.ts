import { IsOptional, IsString } from 'class-validator';

export class ListTtsDto {
  @IsOptional()
  @IsString()
  scriptId?: string;
}
