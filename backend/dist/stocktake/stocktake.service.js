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
exports.StocktakeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const stock_transactions_service_1 = require("../stock-transactions/stock-transactions.service");
let StocktakeService = class StocktakeService {
    constructor(prisma, stockTransactionsService) {
        this.prisma = prisma;
        this.stockTransactionsService = stockTransactionsService;
    }
    async create(createStocktakeDto, userId) {
        console.log('StocktakeService.create called with:', createStocktakeDto);
        console.log('User ID:', userId);
        const { productId, locationId, countedQuantity, remarks } = createStocktakeDto;
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        const location = await this.prisma.location.findUnique({
            where: { id: locationId },
        });
        if (!location) {
            throw new common_1.NotFoundException('Location not found');
        }
        const currentBalance = await this.prisma.stockBalance.findUnique({
            where: {
                productId_locationId: {
                    productId,
                    locationId,
                },
            },
        });
        const systemQuantity = currentBalance ? currentBalance.quantity : 0;
        const adjustment = countedQuantity - systemQuantity;
        if (countedQuantity < 0) {
            throw new common_1.BadRequestException('Counted quantity cannot be negative');
        }
        return this.prisma.$transaction(async (tx) => {
            const stocktake = await tx.stocktake.create({
                data: {
                    productId,
                    locationId,
                    countedQuantity,
                    systemQuantity,
                    adjustment,
                    performedBy: userId,
                },
            });
            if (adjustment !== 0) {
                const transactionRemarks = remarks
                    ? `Stocktake adjustment - System: ${systemQuantity}, Counted: ${countedQuantity}. Notes: ${remarks}`
                    : `Stocktake adjustment - System: ${systemQuantity}, Counted: ${countedQuantity}`;
                await this.stockTransactionsService.create({
                    productId,
                    fromLocationId: locationId,
                    type: 'ADJUSTMENT',
                    quantity: adjustment,
                    referenceNo: `ST-${stocktake.id.slice(-8)}`,
                    remarks: transactionRemarks,
                }, userId);
            }
            return stocktake;
        });
    }
    async findAll(productId, locationId) {
        const where = {};
        if (productId) {
            where.productId = productId;
        }
        if (locationId) {
            where.locationId = locationId;
        }
        return this.prisma.stocktake.findMany({
            where,
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        sku: true,
                        uom: {
                            select: {
                                symbol: true
                            }
                        },
                    },
                },
                location: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                    },
                },
                performer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const stocktake = await this.prisma.stocktake.findUnique({
            where: { id },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        sku: true,
                        uom: {
                            select: {
                                symbol: true
                            }
                        },
                    },
                },
                location: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                    },
                },
                performer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
        if (!stocktake) {
            throw new common_1.NotFoundException('Stocktake not found');
        }
        return stocktake;
    }
    async getStocktakeSummary(locationId) {
        const where = {};
        if (locationId) {
            where.locationId = locationId;
        }
        const stocktakes = await this.prisma.stocktake.findMany({
            where,
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        sku: true,
                        uom: {
                            select: {
                                symbol: true
                            }
                        },
                    },
                },
                location: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        const summary = {
            totalCount: stocktakes.length,
            adjustments: stocktakes.filter(s => s.adjustment !== 0).length,
            totalAdjustment: stocktakes.reduce((sum, s) => sum + s.adjustment, 0),
            recentStocktakes: stocktakes.slice(0, 10),
        };
        return summary;
    }
};
exports.StocktakeService = StocktakeService;
exports.StocktakeService = StocktakeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        stock_transactions_service_1.StockTransactionsService])
], StocktakeService);
//# sourceMappingURL=stocktake.service.js.map