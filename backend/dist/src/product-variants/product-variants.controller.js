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
exports.ProductVariantsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const product_variants_service_1 = require("./product-variants.service");
const create_product_variant_dto_1 = require("./dto/create-product-variant.dto");
const update_product_variant_dto_1 = require("./dto/update-product-variant.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let ProductVariantsController = class ProductVariantsController {
    constructor(productVariantsService) {
        this.productVariantsService = productVariantsService;
    }
    create(productId, createVariantDto) {
        return this.productVariantsService.create(productId, createVariantDto);
    }
    findAll(productId) {
        return this.productVariantsService.findAll(productId);
    }
    findOne(id) {
        return this.productVariantsService.findOne(id);
    }
    update(id, updateVariantDto) {
        return this.productVariantsService.update(id, updateVariantDto);
    }
    remove(id) {
        return this.productVariantsService.remove(id);
    }
    toggleActive(id) {
        return this.productVariantsService.toggleActive(id);
    }
};
exports.ProductVariantsController = ProductVariantsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new product variant' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Variant created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Product not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Variant with this SKU or barcode already exists' }),
    __param(0, (0, common_1.Param)('productId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_product_variant_dto_1.CreateProductVariantDto]),
    __metadata("design:returntype", void 0)
], ProductVariantsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all variants for a product' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Variants retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Product not found' }),
    __param(0, (0, common_1.Param)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductVariantsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get variant by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Variant retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Variant not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductVariantsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update variant' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Variant updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Variant not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Variant with this SKU or barcode already exists' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_product_variant_dto_1.UpdateProductVariantDto]),
    __metadata("design:returntype", void 0)
], ProductVariantsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete variant' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Variant deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Variant not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductVariantsController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':id/toggle-active'),
    (0, swagger_1.ApiOperation)({ summary: 'Toggle variant active status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Variant status toggled successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Variant not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductVariantsController.prototype, "toggleActive", null);
exports.ProductVariantsController = ProductVariantsController = __decorate([
    (0, swagger_1.ApiTags)('Product Variants'),
    (0, common_1.Controller)('products/:productId/variants'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [product_variants_service_1.ProductVariantsService])
], ProductVariantsController);
//# sourceMappingURL=product-variants.controller.js.map