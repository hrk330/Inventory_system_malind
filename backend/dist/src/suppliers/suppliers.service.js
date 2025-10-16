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
var SuppliersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuppliersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SuppliersService = SuppliersService_1 = class SuppliersService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(SuppliersService_1.name);
    }
    async create(createSupplierDto) {
        this.logger.log(`Creating supplier: ${createSupplierDto.name}`);
        const existingSupplier = await this.prisma.supplier.findFirst({
            where: { name: createSupplierDto.name },
        });
        if (existingSupplier) {
            this.logger.warn(`Supplier with name ${createSupplierDto.name} already exists`);
            throw new common_1.ConflictException('Supplier with this name already exists');
        }
        const supplier = await this.prisma.supplier.create({
            data: createSupplierDto,
        });
        this.logger.log(`Supplier created successfully: ${supplier.id}`);
        return supplier;
    }
    async findAll(search) {
        this.logger.log(`Fetching suppliers - search: ${search || 'none'}`);
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { contactPerson: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }
        const suppliers = await this.prisma.supplier.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
        this.logger.log(`Found ${suppliers.length} suppliers`);
        return suppliers;
    }
    async findOne(id) {
        this.logger.log(`Fetching supplier: ${id}`);
        const supplier = await this.prisma.supplier.findUnique({
            where: { id },
        });
        if (!supplier) {
            this.logger.warn(`Supplier not found: ${id}`);
            throw new common_1.NotFoundException('Supplier not found');
        }
        this.logger.log(`Supplier found: ${supplier.name}`);
        return supplier;
    }
    async update(id, updateSupplierDto) {
        this.logger.log(`Updating supplier: ${id}`);
        await this.findOne(id);
        if (updateSupplierDto.name) {
            const existingSupplier = await this.prisma.supplier.findFirst({
                where: {
                    name: updateSupplierDto.name,
                    id: { not: id }
                },
            });
            if (existingSupplier) {
                this.logger.warn(`Supplier with name ${updateSupplierDto.name} already exists`);
                throw new common_1.ConflictException('Supplier with this name already exists');
            }
        }
        const updatedSupplier = await this.prisma.supplier.update({
            where: { id },
            data: updateSupplierDto,
        });
        this.logger.log(`Supplier updated successfully: ${updatedSupplier.id}`);
        return updatedSupplier;
    }
    async remove(id) {
        this.logger.log(`Deleting supplier: ${id}`);
        await this.findOne(id);
        const products = await this.prisma.product.findMany({
            where: { supplierId: id },
        });
        if (products.length > 0) {
            this.logger.warn(`Cannot delete supplier ${id}: has associated products`);
            throw new common_1.ConflictException('Cannot delete supplier with associated products');
        }
        await this.prisma.supplier.delete({
            where: { id },
        });
        this.logger.log(`Supplier deleted successfully: ${id}`);
        return { message: 'Supplier deleted successfully' };
    }
    async toggleActive(id) {
        this.logger.log(`Toggling active status for supplier: ${id}`);
        const supplier = await this.findOne(id);
        const updatedSupplier = await this.prisma.supplier.update({
            where: { id },
            data: { isActive: !supplier.isActive },
        });
        this.logger.log(`Supplier ${id} is now ${updatedSupplier.isActive ? 'active' : 'inactive'}`);
        return updatedSupplier;
    }
    async bulkDelete(ids) {
        this.logger.log(`Bulk deleting ${ids.length} suppliers`);
        const suppliersWithProducts = await this.prisma.supplier.findMany({
            where: {
                id: { in: ids },
                products: {
                    some: {}
                }
            },
            select: { id: true, name: true }
        });
        if (suppliersWithProducts.length > 0) {
            const supplierNames = suppliersWithProducts.map(s => s.name);
            throw new common_1.ConflictException(`Cannot delete suppliers with products: ${supplierNames.join(', ')}`);
        }
        const deletedSuppliers = await this.prisma.supplier.deleteMany({
            where: { id: { in: ids } },
        });
        this.logger.log(`Bulk deleted ${deletedSuppliers.count} suppliers`);
        return { count: deletedSuppliers.count, message: 'Suppliers deleted successfully' };
    }
};
exports.SuppliersService = SuppliersService;
exports.SuppliersService = SuppliersService = SuppliersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SuppliersService);
//# sourceMappingURL=suppliers.service.js.map