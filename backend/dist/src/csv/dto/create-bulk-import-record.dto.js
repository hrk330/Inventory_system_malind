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
exports.CreateBulkImportRecordDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const bulk_import_record_dto_1 = require("./bulk-import-record.dto");
class CreateBulkImportRecordDto {
}
exports.CreateBulkImportRecordDto = CreateBulkImportRecordDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'products-import-2024-01-15.xlsx' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBulkImportRecordDto.prototype, "fileName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'products-import-2024-01-15.xlsx' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBulkImportRecordDto.prototype, "originalFileName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: bulk_import_record_dto_1.ImportStatus, example: bulk_import_record_dto_1.ImportStatus.PENDING }),
    (0, class_validator_1.IsEnum)(bulk_import_record_dto_1.ImportStatus),
    __metadata("design:type", String)
], CreateBulkImportRecordDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 100 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateBulkImportRecordDto.prototype, "totalRecords", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 0 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateBulkImportRecordDto.prototype, "successfulRecords", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 0 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateBulkImportRecordDto.prototype, "failedRecords", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: [], required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateBulkImportRecordDto.prototype, "errors", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBulkImportRecordDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: {
            productsCreated: 0,
            productsUpdated: 0,
            categoriesCreated: 0,
            uomsCreated: 0
        },
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateBulkImportRecordDto.prototype, "summary", void 0);
//# sourceMappingURL=create-bulk-import-record.dto.js.map