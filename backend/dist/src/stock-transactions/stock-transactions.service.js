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
exports.StockTransactionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
let StockTransactionsService = class StockTransactionsService {
    constructor(prisma, auditService) {
        this.prisma = prisma;
        this.auditService = auditService;
    }
    async create(createStockTransactionDto, userId) {
        const { productId, fromLocationId, toLocationId, type, quantity, referenceNo, remarks } = createStockTransactionDto;
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        if (fromLocationId) {
            const fromLocation = await this.prisma.location.findUnique({
                where: { id: fromLocationId },
            });
            if (!fromLocation) {
                throw new common_1.NotFoundException('From location not found');
            }
        }
        if (toLocationId) {
            const toLocation = await this.prisma.location.findUnique({
                where: { id: toLocationId },
            });
            if (!toLocation) {
                throw new common_1.NotFoundException('To location not found');
            }
        }
        this.validateTransactionType(type, fromLocationId, toLocationId);
        if (type !== 'ADJUSTMENT' && quantity <= 0) {
            throw new common_1.BadRequestException('Quantity must be greater than 0');
        }
        if (type === 'ADJUSTMENT' && quantity === 0) {
            throw new common_1.BadRequestException('Adjustment quantity cannot be zero');
        }
        if (type === 'ISSUE' || type === 'TRANSFER') {
            const currentBalance = await this.getCurrentBalance(productId, fromLocationId);
            if (currentBalance < quantity) {
                throw new common_1.BadRequestException('Insufficient stock');
            }
        }
        const finalReferenceNo = referenceNo || await this.generateReferenceNumber(type);
        return this.prisma.$transaction(async (tx) => {
            const transaction = await tx.stockTransaction.create({
                data: {
                    productId,
                    fromLocationId,
                    toLocationId,
                    type,
                    quantity,
                    referenceNo: finalReferenceNo,
                    remarks,
                    createdBy: userId,
                },
            });
            await this.updateStockBalances(tx, productId, fromLocationId, toLocationId, type, quantity);
            try {
                await this.auditService.log(userId, 'StockTransaction', transaction.id, 'CREATE', null, {
                    productId: transaction.productId,
                    fromLocationId: transaction.fromLocationId,
                    toLocationId: transaction.toLocationId,
                    type: transaction.type,
                    quantity: transaction.quantity,
                    referenceNo: transaction.referenceNo,
                    remarks: transaction.remarks,
                });
            }
            catch (auditError) {
                console.warn(`Failed to log audit trail for stock transaction: ${auditError.message}`);
            }
            return transaction;
        });
    }
    async findAll(productId, locationId, type) {
        const where = {};
        if (productId) {
            where.productId = productId;
        }
        if (locationId) {
            where.OR = [
                { fromLocationId: locationId },
                { toLocationId: locationId },
            ];
        }
        if (type) {
            where.type = type;
        }
        return this.prisma.stockTransaction.findMany({
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
                fromLocation: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                    },
                },
                toLocation: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                    },
                },
                creator: {
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
        const transaction = await this.prisma.stockTransaction.findUnique({
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
                fromLocation: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                    },
                },
                toLocation: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                    },
                },
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
        if (!transaction) {
            throw new common_1.NotFoundException('Transaction not found');
        }
        return transaction;
    }
    validateTransactionType(type, fromLocationId, toLocationId) {
        switch (type) {
            case 'RECEIPT':
                if (!toLocationId) {
                    throw new common_1.BadRequestException('To location is required for RECEIPT transaction');
                }
                if (fromLocationId) {
                    throw new common_1.BadRequestException('From location should not be specified for RECEIPT transaction');
                }
                break;
            case 'ISSUE':
                if (!fromLocationId) {
                    throw new common_1.BadRequestException('From location is required for ISSUE transaction');
                }
                if (toLocationId) {
                    throw new common_1.BadRequestException('To location should not be specified for ISSUE transaction');
                }
                break;
            case 'TRANSFER':
                if (!fromLocationId || !toLocationId) {
                    throw new common_1.BadRequestException('Both from and to locations are required for TRANSFER transaction');
                }
                if (fromLocationId === toLocationId) {
                    throw new common_1.BadRequestException('From and to locations cannot be the same');
                }
                break;
            case 'ADJUSTMENT':
                if (!fromLocationId) {
                    throw new common_1.BadRequestException('From location is required for ADJUSTMENT transaction');
                }
                if (toLocationId) {
                    throw new common_1.BadRequestException('To location should not be specified for ADJUSTMENT transaction');
                }
                break;
            default:
                throw new common_1.BadRequestException('Invalid transaction type');
        }
    }
    async getCurrentBalance(productId, locationId) {
        const balance = await this.prisma.stockBalance.findUnique({
            where: {
                productId_locationId: {
                    productId,
                    locationId,
                },
            },
        });
        return balance ? balance.quantity : 0;
    }
    async updateStockBalances(tx, productId, fromLocationId, toLocationId, type, quantity) {
        switch (type) {
            case 'RECEIPT':
                await this.upsertStockBalance(tx, productId, toLocationId, quantity);
                break;
            case 'ISSUE':
                await this.upsertStockBalance(tx, productId, fromLocationId, -quantity);
                break;
            case 'TRANSFER':
                await this.upsertStockBalance(tx, productId, fromLocationId, -quantity);
                await this.upsertStockBalance(tx, productId, toLocationId, quantity);
                break;
            case 'ADJUSTMENT':
                await this.upsertStockBalance(tx, productId, fromLocationId, quantity);
                break;
        }
    }
    async upsertStockBalance(tx, productId, locationId, quantityChange) {
        const existingBalance = await tx.stockBalance.findUnique({
            where: {
                productId_locationId: {
                    productId,
                    locationId,
                },
            },
        });
        const newQuantity = (existingBalance?.quantity || 0) + quantityChange;
        if (newQuantity < 0) {
            console.log(`Stock adjustment: ${quantityChange}, Current: ${existingBalance?.quantity || 0}, New: ${newQuantity}`);
        }
        if (existingBalance) {
            await tx.stockBalance.update({
                where: {
                    productId_locationId: {
                        productId,
                        locationId,
                    },
                },
                data: {
                    quantity: newQuantity,
                    lastUpdated: new Date(),
                },
            });
        }
        else {
            await tx.stockBalance.create({
                data: {
                    productId,
                    locationId,
                    quantity: newQuantity,
                    lastUpdated: new Date(),
                },
            });
        }
    }
    async generateReferenceNumber(type) {
        const prefix = type.charAt(0);
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `${prefix}${timestamp}${random}`;
    }
};
exports.StockTransactionsService = StockTransactionsService;
exports.StockTransactionsService = StockTransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], StockTransactionsService);
//# sourceMappingURL=stock-transactions.service.js.map