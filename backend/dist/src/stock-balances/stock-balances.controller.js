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
exports.StockBalancesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const stock_balances_service_1 = require("./stock-balances.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let StockBalancesController = class StockBalancesController {
    constructor(stockBalancesService) {
        this.stockBalancesService = stockBalancesService;
    }
    findAll(productId, locationId) {
        return this.stockBalancesService.findAll(productId, locationId);
    }
    getReorderAlerts() {
        return this.stockBalancesService.getReorderAlerts();
    }
    getTotalStock(productId) {
        return this.stockBalancesService.getTotalStock(productId);
    }
    getLocationStock(locationId) {
        return this.stockBalancesService.getLocationStock(locationId);
    }
};
exports.StockBalancesController = StockBalancesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all stock balances' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Stock balances retrieved successfully' }),
    (0, swagger_1.ApiQuery)({ name: 'productId', required: false, description: 'Filter by product ID' }),
    (0, swagger_1.ApiQuery)({ name: 'locationId', required: false, description: 'Filter by location ID' }),
    __param(0, (0, common_1.Query)('productId')),
    __param(1, (0, common_1.Query)('locationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], StockBalancesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('reorder-alerts'),
    (0, swagger_1.ApiOperation)({ summary: 'Get reorder alerts' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Reorder alerts retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StockBalancesController.prototype, "getReorderAlerts", null);
__decorate([
    (0, common_1.Get)('total/:productId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get total stock for a product across all locations' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Total stock retrieved successfully' }),
    __param(0, (0, common_1.Query)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StockBalancesController.prototype, "getTotalStock", null);
__decorate([
    (0, common_1.Get)('location/:locationId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get stock for a specific location' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Location stock retrieved successfully' }),
    __param(0, (0, common_1.Param)('locationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StockBalancesController.prototype, "getLocationStock", null);
exports.StockBalancesController = StockBalancesController = __decorate([
    (0, swagger_1.ApiTags)('Stock Balances'),
    (0, common_1.Controller)('stock/balances'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [stock_balances_service_1.StockBalancesService])
], StockBalancesController);
//# sourceMappingURL=stock-balances.controller.js.map