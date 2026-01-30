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
exports.ScriptsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const roles_guard_1 = require("../common/guards/roles.guard");
const create_script_dto_1 = require("./dto/create-script.dto");
const list_scripts_dto_1 = require("./dto/list-scripts.dto");
const scripts_service_1 = require("./scripts.service");
let ScriptsController = class ScriptsController {
    scriptsService;
    constructor(scriptsService) {
        this.scriptsService = scriptsService;
    }
    async create(summaryId, dto) {
        return this.scriptsService.createFromSummary(summaryId, dto.type);
    }
    async listMine(user, query) {
        return this.scriptsService.listByUser(user.id, query);
    }
    async listAll(query) {
        return this.scriptsService.listAll(query);
    }
    async getById(id) {
        return this.scriptsService.getById(id);
    }
};
exports.ScriptsController = ScriptsController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(":summaryId"),
    __param(0, (0, common_1.Param)("summaryId")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_script_dto_1.CreateScriptDto]),
    __metadata("design:returntype", Promise)
], ScriptsController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, list_scripts_dto_1.ListScriptsDto]),
    __metadata("design:returntype", Promise)
], ScriptsController.prototype, "listMine", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, common_1.Get)("all"),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_scripts_dto_1.ListScriptsDto]),
    __metadata("design:returntype", Promise)
], ScriptsController.prototype, "listAll", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ScriptsController.prototype, "getById", null);
exports.ScriptsController = ScriptsController = __decorate([
    (0, common_1.Controller)("scripts"),
    __metadata("design:paramtypes", [scripts_service_1.ScriptsService])
], ScriptsController);
//# sourceMappingURL=scripts.controller.js.map