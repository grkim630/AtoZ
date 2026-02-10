import { IsUUID } from 'class-validator';

export class ClassifyAnalysisDto {
  @IsUUID()
  uploadedFileId: string;
}
