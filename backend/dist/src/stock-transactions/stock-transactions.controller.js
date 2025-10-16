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
exports.StockTransactionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const stock_transactions_service_1 = require("./stock-transactions.service");
const create_stock_transaction_dto_1 = require("./dto/create-stock-transaction.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let StockTransactionsController = class StockTransactionsController {
    constructor(stockTransactionsService) {
        this.stockTransactionsService = stockTransactionsService;
    }
    create(createStockTransactionDto, req) {
        return this.stockTransactionsService.create(createStockTransactionDto, req.user.id);
    }
    findAll(productId, locationId, type) {
        return this.stockTransactionsService.findAll(productId, locationId, type);
    }
    findOne(id) {
        return this.stockTransactionsService.findOne(id);
    }
};
exports.StockTransactionsController = StockTransactionsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new stock transaction' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Transaction created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Product or location not found' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_stock_transaction_dto_1.CreateStockTransactionDto, Object]),
    __metadata("design:returntype", void 0)
], StockTransactionsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all stock transactions' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Transactions retrieved successfully' }),
    (0, swagger_1.ApiQuery)({ name: 'productId', required: false, description: 'Filter by product ID' }),
    (0, swagger_1.ApiQuery)({ name: 'locationId', required: false, description: 'Filter by location ID' }),
    (0, swagger_1.ApiQuery)({ name: 'type', required: false, description: 'Filter by transaction type' }),
    __param(0, (0, common_1.Query)('productId')),
    __param(1, (0, common_1.Query)('locationId')),
    __param(2, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], StockTransactionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get transaction by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Transaction retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Transaction not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StockTransactionsController.prototype, "findOne", null);
exports.StockTransactionsController = StockTransactionsController = __decorate([
    (0, swagger_1.ApiTags)('Stock Transactions'),
    (0, common_1.Controller)('stock/transactions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [stock_transactions_service_1.StockTransactionsService])
], StockTransactionsController);
//# sourceMappingURL=stock-transactions.controller.js.map