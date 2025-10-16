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
exports.ReorderService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ReorderService = class ReorderService {
    constructor(prisma) {
        this.prisma = prisma;
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
    async getReorderSummary() {
        const alerts = await this.getReorderAlerts();
        const summary = {
            totalAlerts: alerts.length,
            criticalAlerts: alerts.filter(alert => alert.quantity <= 0).length,
            lowStockAlerts: alerts.filter(alert => alert.quantity > 0 && alert.quantity < alert.product.reorderLevel).length,
            alertsByLocation: this.groupByLocation(alerts),
            alertsByProduct: this.groupByProduct(alerts),
        };
        return summary;
    }
    async getReorderSuggestions(productId) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
            include: {
                uom: {
                    select: {
                        symbol: true
                    }
                },
                stockBalances: {
                    include: {
                        location: {
                            select: {
                                id: true,
                                name: true,
                                type: true,
                            },
                        },
                    },
                },
            },
        });
        if (!product) {
            return null;
        }
        const totalStock = product.stockBalances.reduce((sum, balance) => sum + balance.quantity, 0);
        const suggestedReorder = Math.max(0, product.reorderLevel - totalStock);
        return {
            product: {
                id: product.id,
                name: product.name,
                sku: product.sku,
                unit: product.uom.symbol,
                reorderLevel: product.reorderLevel,
            },
            currentStock: totalStock,
            suggestedReorder,
            stockByLocation: product.stockBalances.map(balance => ({
                location: balance.location,
                quantity: balance.quantity,
                status: balance.quantity < product.reorderLevel ? 'LOW' : 'OK',
            })),
        };
    }
    groupByLocation(alerts) {
        const grouped = alerts.reduce((acc, alert) => {
            const locationName = alert.location.name;
            if (!acc[locationName]) {
                acc[locationName] = [];
            }
            acc[locationName].push(alert);
            return acc;
        }, {});
        return Object.keys(grouped).map(locationName => ({
            location: locationName,
            count: grouped[locationName].length,
            alerts: grouped[locationName],
        }));
    }
    groupByProduct(alerts) {
        const grouped = alerts.reduce((acc, alert) => {
            const productName = alert.product.name;
            if (!acc[productName]) {
                acc[productName] = [];
            }
            acc[productName].push(alert);
            return acc;
        }, {});
        return Object.keys(grouped).map(productName => ({
            product: productName,
            count: grouped[productName].length,
            alerts: grouped[productName],
        }));
    }
};
exports.ReorderService = ReorderService;
exports.ReorderService = ReorderService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReorderService);
//# sourceMappingURL=reorder.service.js.map