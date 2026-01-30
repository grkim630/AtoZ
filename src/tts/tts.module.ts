import { Module } from "@nestjs/common";
import { AiModule } from "../ai/ai.module";
import { TtsController } from "./tts.controller";
import { TtsService } from "./tts.service";

@Module({
  imports: [AiModule],
  controllers: [TtsController],
  providers: [TtsService],
  exports: [TtsService],
})
export class TtsModule {}
