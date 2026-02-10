import { IsIn, IsString, MinLength } from 'class-validator';
import { PHISHING_TYPES } from '../model/phishing-taxonomy';

export class ValidateScriptDto {
  @IsString()
  @MinLength(5)
  script: string;

  @IsString()
  @IsIn(PHISHING_TYPES)
  expectedType: (typeof PHISHING_TYPES)[number];
}
