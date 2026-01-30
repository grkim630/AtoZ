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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExperienceController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const experience_service_1 = require("./experience.service");
let ExperienceController = class ExperienceController {
    experienceService;
    constructor(experienceService) {
        this.experienceService = experienceService;
    }
    async getScenario(keyword, type) {
        if (!keyword) {
            throw new common_1.BadRequestException("keyword is required");
        }
        let parsedType;
        if (type) {
            const normalized = type.toLowerCase();
            if (normalized === "call") {
                parsedType = client_1.ScriptType.CALL;
            }
            else if (normalized === "chat") {
                parsedType = client_1.ScriptType.CHAT;
            }
            else {
                throw new common_1.BadRequestException("type must be call or chat");
            }
        }
        return this.experienceService.getRandomScenario(keyword, parsedType);
    }
};
exports.ExperienceController = ExperienceController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)("scenario"),
    __param(0, (0, common_1.Query)("keyword")),
    __param(1, (0, common_1.Query)("type")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ExperienceController.prototype, "getScenario", null);
exports.ExperienceController = ExperienceController = __decorate([
    (0, common_1.Controller)("experience"),
    __metadata("design:paramtypes", [experience_service_1.ExperienceService])
], ExperienceController);
//# sourceMappingURL=experience.controller.js.map