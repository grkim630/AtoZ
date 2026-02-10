import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ClassifyAnalysisDto } from '../dto/classify-analysis.dto';
import { RunAnalysisPipelineDto } from '../dto/run-analysis-pipeline.dto';
import { ValidateScriptDto } from '../dto/validate-script.dto';
import { AnalysisService } from '../service/analysis.service';

@Controller('analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @UseGuards(JwtAuthGuard)
  @Post('classify')
  async classify(
    @CurrentUser() user: { id: string },
    @Body() dto: ClassifyAnalysisDto,
  ) {
    return this.analysisService.classifyByUploadedFile(
      user.id,
      dto.uploadedFileId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('validate-script')
  async validateScript(@Body() dto: ValidateScriptDto) {
    return this.analysisService.validateScript(dto.script, dto.expectedType);
  }

  @UseGuards(JwtAuthGuard)
  @Post('pipeline')
  async runPipeline(
    @CurrentUser() user: { id: string },
    @Body() dto: RunAnalysisPipelineDto,
  ) {
    return this.analysisService.runPipeline(user.id, dto);
  }
}
