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
exports.StocktakeController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const stocktake_service_1 = require("./stocktake.service");
const create_stocktake_dto_1 = require("./dto/create-stocktake.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let StocktakeController = class StocktakeController {
    constructor(stocktakeService) {
        this.stocktakeService = stocktakeService;
    }
    async create(createStocktakeDto, req) {
        try {
            console.log('Stocktake request received:', createStocktakeDto);
            console.log('User ID:', req.user.id);
            console.log('Data types:', {
                productId: typeof createStocktakeDto.productId,
                locationId: typeof createStocktakeDto.locationId,
                countedQuantity: typeof createStocktakeDto.countedQuantity,
                remarks: typeof createStocktakeDto.remarks
            });
            const result = await this.stocktakeService.create(createStocktakeDto, req.user.id);
            console.log('Stocktake created successfully:', result);
            return result;
        }
        catch (error) {
            console.error('Error in stocktake controller:', error);
            throw error;
        }
    }
    findAll(productId, locationId) {
        return this.stocktakeService.findAll(productId, locationId);
    }
    getSummary(locationId) {
        return this.stocktakeService.getStocktakeSummary(locationId);
    }
    findOne(id) {
        return this.stocktakeService.findOne(id);
    }
};
exports.StocktakeController = StocktakeController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new stocktake' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Stocktake created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Product or location not found' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_stocktake_dto_1.CreateStocktakeDto, Object]),
    __metadata("design:returntype", Promise)
], StocktakeController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all stocktakes' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Stocktakes retrieved successfully' }),
    (0, swagger_1.ApiQuery)({ name: 'productId', required: false, description: 'Filter by product ID' }),
    (0, swagger_1.ApiQuery)({ name: 'locationId', required: false, description: 'Filter by location ID' }),
    __param(0, (0, common_1.Query)('productId')),
    __param(1, (0, common_1.Query)('locationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], StocktakeController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Get stocktake summary' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Summary retrieved successfully' }),
    (0, swagger_1.ApiQuery)({ name: 'locationId', required: false, description: 'Filter by location ID' }),
    __param(0, (0, common_1.Query)('locationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StocktakeController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get stocktake by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Stocktake retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Stocktake not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StocktakeController.prototype, "findOne", null);
exports.StocktakeController = StocktakeController = __decorate([
    (0, swagger_1.ApiTags)('Stocktake'),
    (0, common_1.Controller)('stocktake'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [stocktake_service_1.StocktakeService])
], StocktakeController);
//# sourceMappingURL=stocktake.controller.js.map