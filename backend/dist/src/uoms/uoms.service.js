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
var UOMsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UOMsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let UOMsService = UOMsService_1 = class UOMsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(UOMsService_1.name);
    }
    async create(createUOMDto) {
        this.logger.log(`Creating UOM: ${createUOMDto.name} (${createUOMDto.symbol})`);
        const existingUOM = await this.prisma.uOM.findUnique({
            where: { symbol: createUOMDto.symbol },
        });
        if (existingUOM) {
            throw new common_1.ConflictException('UOM with this symbol already exists');
        }
        const uom = await this.prisma.uOM.create({
            data: createUOMDto,
        });
        this.logger.log(`UOM created successfully: ${uom.id}`);
        return uom;
    }
    async findAll() {
        this.logger.log('Fetching all UOMs');
        const uoms = await this.prisma.uOM.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: {
                        products: {
                            where: { isActive: true }
                        }
                    }
                }
            }
        });
        const uomsWithCount = uoms.map(uom => ({
            id: uom.id,
            name: uom.name,
            symbol: uom.symbol,
            description: uom.description,
            isActive: uom.isActive,
            createdAt: uom.createdAt,
            updatedAt: uom.updatedAt,
            productCount: uom._count.products
        }));
        this.logger.log(`Found ${uomsWithCount.length} UOMs`);
        return uomsWithCount;
    }
    async findOne(id) {
        this.logger.log(`Finding UOM: ${id}`);
        const uom = await this.prisma.uOM.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        products: {
                            where: { isActive: true }
                        }
                    }
                }
            }
        });
        if (!uom) {
            throw new common_1.NotFoundException('UOM not found');
        }
        return {
            id: uom.id,
            name: uom.name,
            symbol: uom.symbol,
            description: uom.description,
            isActive: uom.isActive,
            createdAt: uom.createdAt,
            updatedAt: uom.updatedAt,
            productCount: uom._count.products
        };
    }
    async update(id, updateUOMDto) {
        this.logger.log(`Updating UOM: ${id}`);
        const existingUOM = await this.prisma.uOM.findUnique({
            where: { id },
        });
        if (!existingUOM) {
            throw new common_1.NotFoundException('UOM not found');
        }
        if (updateUOMDto.symbol && updateUOMDto.symbol !== existingUOM.symbol) {
            const symbolExists = await this.prisma.uOM.findUnique({
                where: { symbol: updateUOMDto.symbol },
            });
            if (symbolExists) {
                throw new common_1.ConflictException('UOM with this symbol already exists');
            }
        }
        const uom = await this.prisma.uOM.update({
            where: { id },
            data: updateUOMDto,
            include: {
                _count: {
                    select: {
                        products: {
                            where: { isActive: true }
                        }
                    }
                }
            }
        });
        this.logger.log(`UOM updated successfully: ${id}`);
        return {
            id: uom.id,
            name: uom.name,
            symbol: uom.symbol,
            description: uom.description,
            isActive: uom.isActive,
            createdAt: uom.createdAt,
            updatedAt: uom.updatedAt,
            productCount: uom._count.products
        };
    }
    async remove(id) {
        this.logger.log(`Deleting UOM: ${id}`);
        const existingUOM = await this.prisma.uOM.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        products: {
                            where: { isActive: true }
                        }
                    }
                }
            }
        });
        if (!existingUOM) {
            throw new common_1.NotFoundException('UOM not found');
        }
        if (existingUOM._count.products > 0) {
            throw new common_1.ConflictException('Cannot delete UOM that is being used by products');
        }
        await this.prisma.uOM.delete({
            where: { id },
        });
        this.logger.log(`UOM deleted successfully: ${id}`);
        return { message: 'UOM deleted successfully' };
    }
    async toggleActive(id) {
        this.logger.log(`Toggling UOM active status: ${id}`);
        const existingUOM = await this.prisma.uOM.findUnique({
            where: { id },
        });
        if (!existingUOM) {
            throw new common_1.NotFoundException('UOM not found');
        }
        const uom = await this.prisma.uOM.update({
            where: { id },
            data: { isActive: !existingUOM.isActive },
        });
        this.logger.log(`UOM active status toggled: ${id} -> ${uom.isActive}`);
        return uom;
    }
    async bulkDelete(ids) {
        this.logger.log(`Bulk deleting ${ids.length} UOMs`);
        const uomsWithProducts = await this.prisma.uOM.findMany({
            where: {
                id: { in: ids },
                products: {
                    some: {}
                }
            },
            select: { id: true, name: true, symbol: true }
        });
        if (uomsWithProducts.length > 0) {
            const uomNames = uomsWithProducts.map(u => `${u.name} (${u.symbol})`);
            throw new common_1.ConflictException(`Cannot delete UOMs that are being used by products: ${uomNames.join(', ')}`);
        }
        const deletedUOMs = await this.prisma.uOM.deleteMany({
            where: { id: { in: ids } },
        });
        this.logger.log(`Bulk deleted ${deletedUOMs.count} UOMs`);
        return { count: deletedUOMs.count, message: 'UOMs deleted successfully' };
    }
};
exports.UOMsService = UOMsService;
exports.UOMsService = UOMsService = UOMsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UOMsService);
//# sourceMappingURL=uoms.service.js.map