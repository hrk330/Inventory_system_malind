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
exports.BulkImportRecordDto = exports.ImportStatus = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
var ImportStatus;
(function (ImportStatus) {
    ImportStatus["PENDING"] = "pending";
    ImportStatus["PROCESSING"] = "processing";
    ImportStatus["COMPLETED"] = "completed";
    ImportStatus["FAILED"] = "failed";
})(ImportStatus || (exports.ImportStatus = ImportStatus = {}));
class BulkImportRecordDto {
}
exports.BulkImportRecordDto = BulkImportRecordDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BulkImportRecordDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'products-import-2024-01-15.xlsx' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BulkImportRecordDto.prototype, "fileName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'products-import-2024-01-15.xlsx' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BulkImportRecordDto.prototype, "originalFileName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ImportStatus, example: ImportStatus.COMPLETED }),
    (0, class_validator_1.IsEnum)(ImportStatus),
    __metadata("design:type", String)
], BulkImportRecordDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 100 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], BulkImportRecordDto.prototype, "totalRecords", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 95 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], BulkImportRecordDto.prototype, "successfulRecords", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], BulkImportRecordDto.prototype, "failedRecords", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['Row 10: Invalid SKU format', 'Row 25: Missing required field'], required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], BulkImportRecordDto.prototype, "errors", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-01-15T10:30:00Z' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], BulkImportRecordDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-01-15T10:35:00Z', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], BulkImportRecordDto.prototype, "completedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BulkImportRecordDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'John Doe' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BulkImportRecordDto.prototype, "userName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'john@example.com' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BulkImportRecordDto.prototype, "userEmail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: {
            productsCreated: 80,
            productsUpdated: 15,
            categoriesCreated: 3,
            uomsCreated: 2
        },
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], BulkImportRecordDto.prototype, "summary", void 0);
//# sourceMappingURL=bulk-import-record.dto.js.map