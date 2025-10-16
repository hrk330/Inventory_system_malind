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
exports.ReorderController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const reorder_service_1 = require("./reorder.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let ReorderController = class ReorderController {
    constructor(reorderService) {
        this.reorderService = reorderService;
    }
    getAlerts() {
        return this.reorderService.getReorderAlerts();
    }
    getSummary() {
        return this.reorderService.getReorderSummary();
    }
    getSuggestions(productId) {
        return this.reorderService.getReorderSuggestions(productId);
    }
};
exports.ReorderController = ReorderController;
__decorate([
    (0, common_1.Get)('alerts'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all reorder alerts' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Reorder alerts retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ReorderController.prototype, "getAlerts", null);
__decorate([
    (0, common_1.Get)('summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Get reorder summary' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Reorder summary retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ReorderController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Get)('suggestions/:productId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get reorder suggestions for a product' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Reorder suggestions retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Product not found' }),
    __param(0, (0, common_1.Param)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReorderController.prototype, "getSuggestions", null);
exports.ReorderController = ReorderController = __decorate([
    (0, swagger_1.ApiTags)('Reorder Alerts'),
    (0, common_1.Controller)('reorder'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [reorder_service_1.ReorderService])
], ReorderController);
//# sourceMappingURL=reorder.controller.js.map