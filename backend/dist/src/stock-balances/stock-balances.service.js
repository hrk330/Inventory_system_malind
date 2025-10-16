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
exports.StockBalancesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let StockBalancesService = class StockBalancesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(productId, locationId) {
        const where = {};
        if (productId) {
            where.productId = productId;
        }
        if (locationId) {
            where.locationId = locationId;
        }
        return this.prisma.stockBalance.findMany({
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
                        reorderLevel: true,
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
            orderBy: [
                { product: { name: 'asc' } },
                { location: { name: 'asc' } },
            ],
        });
    }
    async findOne(productId, locationId) {
        return this.prisma.stockBalance.findUnique({
            where: {
                productId_locationId: {
                    productId,
                    locationId,
                },
            },
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
                        reorderLevel: true,
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
        });
    }
    async getReorderAlerts() {
        const stockBalances = await this.prisma.stockBalance.findMany({
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
                        reorderLevel: true,
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
            orderBy: [
                { product: { name: 'asc' } },
                { location: { name: 'asc' } },
            ],
        });
        return stockBalances.filter(balance => balance.quantity < balance.product.reorderLevel);
    }
    async getTotalStock(productId) {
        const balances = await this.prisma.stockBalance.findMany({
            where: { productId },
        });
        return balances.reduce((total, balance) => total + balance.quantity, 0);
    }
    async getLocationStock(locationId) {
        console.log(`🔍 Fetching stock for location: ${locationId}`);
        const stockBalances = await this.prisma.stockBalance.findMany({
            where: { locationId },
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
                        reorderLevel: true,
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
            orderBy: { product: { name: 'asc' } },
        });
        console.log(`📊 Found ${stockBalances.length} stock balances for location ${locationId}:`, stockBalances.map(sb => ({
            productName: sb.product.name,
            productSku: sb.product.sku,
            locationName: sb.location.name,
            locationType: sb.location.type,
            quantity: sb.quantity
        })));
        return stockBalances;
    }
};
exports.StockBalancesService = StockBalancesService;
exports.StockBalancesService = StockBalancesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StockBalancesService);
//# sourceMappingURL=stock-balances.service.js.map