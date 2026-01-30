import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { UploadsModule } from "./uploads/uploads.module";
import { ExtractedTextModule } from "./extracted-text/extracted-text.module";
import { SummariesModule } from "./summaries/summaries.module";
import { ScriptsModule } from "./scripts/scripts.module";
import { TtsModule } from "./tts/tts.module";
import { LogsModule } from "./logs/logs.module";
import { ExperienceModule } from "./experience/experience.module";

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
