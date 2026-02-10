import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { UploadsModule } from './uploads/uploads.module';
import { ExtractedTextModule } from './extracted-text/extracted-text.module';
import { SummariesModule } from './summaries/summaries.module';
import { ScriptsModule } from './scripts/scripts.module';
import { TtsModule } from './tts/tts.module';
import { LogsModule } from './logs/logs.module';
import { ExperienceModule } from './experience/experience.module';
import { SessionsModule } from './sessions/sessions.module';
import { LlmFeedbackModule } from './llm-feedback/llm-feedback.module';
import { AnalysisModule } from './analysis/analysis.module';
import { RequestLoggingMiddleware } from './common/middleware/request-logging.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    UploadsModule,
    ExtractedTextModule,
    SummariesModule,
    ScriptsModule,
    TtsModule,
    LogsModule,
    ExperienceModule,
    SessionsModule,
    LlmFeedbackModule,
    AnalysisModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestLoggingMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
