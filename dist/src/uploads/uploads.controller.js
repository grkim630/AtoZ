"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var UploadsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadsController = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const platform_express_1 = require("@nestjs/platform-express");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const roles_guard_1 = require("../common/guards/roles.guard");
const list_uploads_dto_1 = require("./dto/list-uploads.dto");
const upload_file_dto_1 = require("./dto/upload-file.dto");
const uploads_service_1 = require("./uploads.service");
let UploadsController = UploadsController_1 = class UploadsController {
    uploadsService;
    logger = new common_2.Logger(UploadsController_1.name);
    constructor(uploadsService) {
        this.uploadsService = uploadsService;
    }
    async upload(user, dto, file) {
        if (!file) {
            this.logger.warn(`Upload missing file: userId=${user.id} type=${dto?.type ?? "unknown"}`);
            throw new common_1.BadRequestException("File is required");
        }
        return this.uploadsService.createUploadedFile({
            userId: user.id,
            type: dto.type,
            file,
        });
    }
    async listMine(user, query) {
        return this.uploadsService.listByUser(user.id, query);
    }
    async listAll(query) {
        return this.uploadsService.listAll(query);
    }
    async getById(id) {
        return this.uploadsService.getUploadedFile(id);
    }
};
exports.UploadsController = UploadsController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)("file")),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, upload_file_dto_1.UploadFileDto, Object]),
    __metadata("design:returntype", Promise)
], UploadsController.prototype, "upload", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, list_uploads_dto_1.ListUploadsDto]),
    __metadata("design:returntype", Promise)
], UploadsController.prototype, "listMine", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, common_1.Get)("all"),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_uploads_dto_1.ListUploadsDto]),
    __metadata("design:returntype", Promise)
], UploadsController.prototype, "listAll", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UploadsController.prototype, "getById", null);
exports.UploadsController = UploadsController = UploadsController_1 = __decorate([
    (0, common_1.Controller)("uploads"),
    __metadata("design:paramtypes", [uploads_service_1.UploadsService])
], UploadsController);
//# sourceMappingURL=uploads.controller.js.map