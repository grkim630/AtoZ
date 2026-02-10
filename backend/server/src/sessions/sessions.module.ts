import { Module } from '@nestjs/common';
import { SessionEvaluatorService } from './session-evaluator.service';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';

@Module({
  controllers: [SessionsController],
  providers: [SessionsService, SessionEvaluatorService],
})
export class SessionsModule {}
