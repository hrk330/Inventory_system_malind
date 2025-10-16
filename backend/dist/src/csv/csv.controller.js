"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CsvController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const csv_service_1 = require("./csv.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const fs = __importStar(require("fs"));
let CsvController = class CsvController {
    constructor(csvService) {
        this.csvService = csvService;
    }
    async exportProducts(res) {
        const filePath = await this.csvService.exportProducts();
        const file = fs.readFileSync(filePath);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=products.csv');
        res.send(file);
        fs.unlinkSync(filePath);
    }
    async exportStockBalances(res) {
        const filePath = await this.csvService.exportStockBalances();
        const file = fs.readFileSync(filePath);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=stock-balances.csv');
        res.send(file);
        fs.unlinkSync(filePath);
    }
    async exportStockTransactions(res) {
        const filePath = await this.csvService.exportStockTransactions();
        const file = fs.readFileSync(filePath);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=stock-transactions.csv');
        res.send(file);
        fs.unlinkSync(filePath);
    }
    async importProducts(file) {
        if (!file) {
            throw new Error('No file uploaded');
        }
        return this.csvService.importProducts(file);
    }
    async getBulkImportHistory() {
        return this.csvService.getBulkImportHistory();
    }
    async getBulkImportRecord(id) {
        return this.csvService.getBulkImportRecord(id);
    }
    async deleteBulkImportRecord(id) {
        return this.csvService.deleteBulkImportRecord(id);
    }
};
exports.CsvController = CsvController;
__decorate([
    (0, common_1.Get)('export/products'),
    (0, swagger_1.ApiOperation)({ summary: 'Export products to CSV' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Products exported successfully' }),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CsvController.prototype, "exportProducts", null);
__decorate([
    (0, common_1.Get)('export/stock-balances'),
    (0, swagger_1.ApiOperation)({ summary: 'Export stock balances to CSV' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Stock balances exported successfully' }),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CsvController.prototype, "exportStockBalances", null);
__decorate([
    (0, common_1.Get)('export/stock-transactions'),
    (0, swagger_1.ApiOperation)({ summary: 'Export stock transactions to CSV' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Stock transactions exported successfully' }),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CsvController.prototype, "exportStockTransactions", null);
__decorate([
    (0, common_1.Post)('import/products'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiOperation)({ summary: 'Import products from CSV' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Products imported successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CsvController.prototype, "importProducts", null);
__decorate([
    (0, common_1.Get)('bulk-import-history'),
    (0, swagger_1.ApiOperation)({ summary: 'Get bulk import history' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Bulk import history retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CsvController.prototype, "getBulkImportHistory", null);
__decorate([
    (0, common_1.Get)('bulk-import-history/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get specific bulk import record' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Bulk import record retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Bulk import record not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CsvController.prototype, "getBulkImportRecord", null);
__decorate([
    (0, common_1.Delete)('bulk-import-history/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete bulk import record' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Bulk import record deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Bulk import record not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CsvController.prototype, "deleteBulkImportRecord", null);
exports.CsvController = CsvController = __decorate([
    (0, swagger_1.ApiTags)('CSV Import/Export'),
    (0, common_1.Controller)('csv'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [csv_service_1.CsvService])
], CsvController);
//# sourceMappingURL=csv.controller.js.map