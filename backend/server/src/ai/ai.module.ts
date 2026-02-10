import { Module } from '@nestjs/common';
import { AiMockService } from './ai-mock.service';

@Module({
  providers: [AiMockService],
  exports: [AiMockService],
})
export class AiModule {}
