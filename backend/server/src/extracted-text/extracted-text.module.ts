import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { ExtractedTextController } from './extracted-text.controller';
import { ExtractedTextService } from './extracted-text.service';

@Module({
  imports: [AiModule],
  controllers: [ExtractedTextController],
  providers: [ExtractedTextService],
  exports: [ExtractedTextService],
})
export class ExtractedTextModule {}
