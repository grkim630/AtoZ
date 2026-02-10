import { Module } from '@nestjs/common';
import { ExtractedTextModule } from '../extracted-text/extracted-text.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ScriptsModule } from '../scripts/scripts.module';
import { SummariesModule } from '../summaries/summaries.module';
import { AnalysisController } from './controller/analysis.controller';
import { KobertEvaluationModel } from './model/kobert-evaluation.model';
import { AnalysisClassifierService } from './service/analysis-classifier.service';
import { AnalysisService } from './service/analysis.service';
import { ScriptValidationService } from './service/script-validation.service';

@Module({
  imports: [PrismaModule, ExtractedTextModule, SummariesModule, ScriptsModule],
  controllers: [AnalysisController],
  providers: [
    AnalysisService,
    KobertEvaluationModel,
    AnalysisClassifierService,
    ScriptValidationService,
  ],
  exports: [AnalysisService],
})
export class AnalysisModule {}
