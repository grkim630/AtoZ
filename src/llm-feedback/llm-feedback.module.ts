import { Module } from "@nestjs/common";
import { LlmFeedbackController } from "./llm-feedback.controller";
import { LlmFeedbackService } from "./llm-feedback.service";

@Module({
  controllers: [LlmFeedbackController],
  providers: [LlmFeedbackService],
})
export class LlmFeedbackModule {}
