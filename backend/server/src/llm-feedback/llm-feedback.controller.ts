import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { IngestLlmFeedbackDto } from './dto/ingest-llm-feedback.dto';
import { LlmFeedbackService } from './llm-feedback.service';

@Controller('llm-feedback')
export class LlmFeedbackController {
  constructor(private readonly llmFeedbackService: LlmFeedbackService) {}

  @UseGuards(JwtAuthGuard)
  @Post('ingest')
  async ingest(
    @CurrentUser() user: { id: string; role?: string },
    @Body() dto: IngestLlmFeedbackDto,
  ) {
    return this.llmFeedbackService.ingest(user, dto);
  }
}
