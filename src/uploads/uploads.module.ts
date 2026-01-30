import { Module } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { diskStorage } from "multer";
import { extname } from "path";
import { UploadsController } from "./uploads.controller";
import { UploadsService } from "./uploads.service";

@Module({
  imports: [
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const maxBytes =
          Number(configService.get<string>("UPLOAD_MAX_BYTES")) ||
          50 * 1024 * 1024;

        const mimeToExt: Record<string, string> = {
          "audio/mpeg": ".mp3",
          "audio/mp3": ".mp3",
          "audio/mp4": ".m4a",
          "audio/x-m4a": ".m4a",
          "audio/wav": ".wav",
          "image/jpeg": ".jpg",
          "image/jpg": ".jpg",
          "image/png": ".png",
          "text/plain": ".txt",
        };

        return {
          limits: {
            fileSize: maxBytes,
            files: 1,
          },
          storage: diskStorage({
            destination: `${configService.get<string>("UPLOAD_DIR") ?? "uploads"}/raw`,
            filename: (req, file, callback) => {
              const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
              const originalExt = extname(file.originalname ?? "");
              const inferredExt =
                mimeToExt[file.mimetype] ??
                (req?.body?.type === "VOICE"
                  ? ".m4a"
                  : req?.body?.type === "IMAGE"
                    ? ".png"
                    : req?.body?.type === "TEXT"
                      ? ".txt"
                      : "");
              const ext = originalExt || inferredExt;
              callback(null, `${unique}${ext}`);
            },
          }),
        };
      },
    }),
  ],
  controllers: [UploadsController],
  providers: [UploadsService],
  exports: [UploadsService],
})
export class UploadsModule {}
