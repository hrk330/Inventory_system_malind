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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateProductVariantDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateProductVariantDto {
    constructor() {
        this.isActive = true;
    }
}
exports.CreateProductVariantDto = CreateProductVariantDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Size' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProductVariantDto.prototype, "variantName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Large' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProductVariantDto.prototype, "variantValue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'LAPTOP-001-L' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProductVariantDto.prototype, "sku", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '1234567890124', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProductVariantDto.prototype, "barcode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 50.00, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateProductVariantDto.prototype, "additionalPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, default: true }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateProductVariantDto.prototype, "isActive", void 0);
//# sourceMappingURL=create-product-variant.dto.js.map