"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadsModule = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const config_1 = require("@nestjs/config");
const multer_1 = require("multer");
const path_1 = require("path");
const uploads_controller_1 = require("./uploads.controller");
const uploads_service_1 = require("./uploads.service");
let UploadsModule = class UploadsModule {
};
exports.UploadsModule = UploadsModule;
exports.UploadsModule = UploadsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            platform_express_1.MulterModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => {
                    const maxBytes = Number(configService.get("UPLOAD_MAX_BYTES")) ||
                        50 * 1024 * 1024;
                    const mimeToExt = {
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
                        storage: (0, multer_1.diskStorage)({
                            destination: `${configService.get("UPLOAD_DIR") ?? "uploads"}/raw`,
                            filename: (req, file, callback) => {
                                const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
                                const originalExt = (0, path_1.extname)(file.originalname ?? "");
                                const inferredExt = mimeToExt[file.mimetype] ??
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
        controllers: [uploads_controller_1.UploadsController],
        providers: [uploads_service_1.UploadsService],
        exports: [uploads_service_1.UploadsService],
    })
], UploadsModule);
//# sourceMappingURL=uploads.module.js.map