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
exports.UOMsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const uoms_service_1 = require("./uoms.service");
const create_uom_dto_1 = require("./dto/create-uom.dto");
const update_uom_dto_1 = require("./dto/update-uom.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let UOMsController = class UOMsController {
    constructor(uomsService) {
        this.uomsService = uomsService;
    }
    create(createUOMDto) {
        return this.uomsService.create(createUOMDto);
    }
    findAll() {
        return this.uomsService.findAll();
    }
    findOne(id) {
        return this.uomsService.findOne(id);
    }
    update(id, updateUOMDto) {
        return this.uomsService.update(id, updateUOMDto);
    }
    remove(id) {
        return this.uomsService.remove(id);
    }
    bulkDelete(bulkDeleteDto) {
        return this.uomsService.bulkDelete(bulkDeleteDto.ids);
    }
    toggleActive(id) {
        return this.uomsService.toggleActive(id);
    }
};
exports.UOMsController = UOMsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new UOM' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'UOM created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'UOM with this symbol already exists' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_uom_dto_1.CreateUOMDto]),
    __metadata("design:returntype", void 0)
], UOMsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all UOMs' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'UOMs retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UOMsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get UOM by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'UOM retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'UOM not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UOMsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update UOM' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'UOM updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'UOM not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'UOM with this symbol already exists' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_uom_dto_1.UpdateUOMDto]),
    __metadata("design:returntype", void 0)
], UOMsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete UOM' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'UOM deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'UOM not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Cannot delete UOM that is being used by products' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UOMsController.prototype, "remove", null);
__decorate([
    (0, common_1.Delete)('bulk'),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk delete UOMs' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'UOMs deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Some UOMs cannot be deleted' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UOMsController.prototype, "bulkDelete", null);
__decorate([
    (0, common_1.Patch)(':id/toggle-active'),
    (0, swagger_1.ApiOperation)({ summary: 'Toggle UOM active status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'UOM status toggled successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'UOM not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UOMsController.prototype, "toggleActive", null);
exports.UOMsController = UOMsController = __decorate([
    (0, swagger_1.ApiTags)('UOMs'),
    (0, common_1.Controller)('uoms'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [uoms_service_1.UOMsService])
], UOMsController);
//# sourceMappingURL=uoms.controller.js.map