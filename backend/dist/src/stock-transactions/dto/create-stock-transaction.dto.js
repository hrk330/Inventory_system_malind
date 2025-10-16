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
exports.CreateStockTransactionDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateStockTransactionDto {
}
exports.CreateStockTransactionDto = CreateStockTransactionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-of-product' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateStockTransactionDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-of-from-location', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateStockTransactionDto.prototype, "fromLocationId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-of-to-location', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateStockTransactionDto.prototype, "toLocationId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'RECEIPT',
        enum: ['RECEIPT', 'ISSUE', 'TRANSFER', 'ADJUSTMENT']
    }),
    (0, class_validator_1.IsEnum)(['RECEIPT', 'ISSUE', 'TRANSFER', 'ADJUSTMENT']),
    __metadata("design:type", String)
], CreateStockTransactionDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 10 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Number)
], CreateStockTransactionDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'REF-001', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateStockTransactionDto.prototype, "referenceNo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Stock received from supplier', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateStockTransactionDto.prototype, "remarks", void 0);
//# sourceMappingURL=create-stock-transaction.dto.js.map