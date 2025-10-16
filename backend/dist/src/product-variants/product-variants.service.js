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
var ProductVariantsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductVariantsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ProductVariantsService = ProductVariantsService_1 = class ProductVariantsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ProductVariantsService_1.name);
    }
    async create(productId, createVariantDto) {
        this.logger.log(`Creating variant for product: ${productId}`);
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            this.logger.warn(`Product not found: ${productId}`);
            throw new common_1.NotFoundException('Product not found');
        }
        const existingVariant = await this.prisma.productVariant.findUnique({
            where: { sku: createVariantDto.sku },
        });
        if (existingVariant) {
            this.logger.warn(`Variant with SKU ${createVariantDto.sku} already exists`);
            throw new common_1.ConflictException('Variant with this SKU already exists');
        }
        if (createVariantDto.barcode) {
            const existingBarcode = await this.prisma.productVariant.findUnique({
                where: { barcode: createVariantDto.barcode },
            });
            if (existingBarcode) {
                this.logger.warn(`Variant with barcode ${createVariantDto.barcode} already exists`);
                throw new common_1.ConflictException('Variant with this barcode already exists');
            }
        }
        const variant = await this.prisma.productVariant.create({
            data: {
                ...createVariantDto,
                productId,
            },
        });
        this.logger.log(`Variant created successfully: ${variant.id}`);
        return variant;
    }
    async findAll(productId) {
        this.logger.log(`Fetching variants for product: ${productId}`);
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            this.logger.warn(`Product not found: ${productId}`);
            throw new common_1.NotFoundException('Product not found');
        }
        const variants = await this.prisma.productVariant.findMany({
            where: { productId },
            orderBy: { createdAt: 'desc' },
        });
        this.logger.log(`Found ${variants.length} variants for product ${productId}`);
        return variants;
    }
    async findOne(id) {
        this.logger.log(`Fetching variant: ${id}`);
        const variant = await this.prisma.productVariant.findUnique({
            where: { id },
            include: { product: true },
        });
        if (!variant) {
            this.logger.warn(`Variant not found: ${id}`);
            throw new common_1.NotFoundException('Variant not found');
        }
        this.logger.log(`Variant found: ${variant.id}`);
        return variant;
    }
    async update(id, updateVariantDto) {
        this.logger.log(`Updating variant: ${id}`);
        await this.findOne(id);
        if (updateVariantDto.sku) {
            const existingVariant = await this.prisma.productVariant.findFirst({
                where: {
                    sku: updateVariantDto.sku,
                    id: { not: id }
                },
            });
            if (existingVariant) {
                this.logger.warn(`Variant with SKU ${updateVariantDto.sku} already exists`);
                throw new common_1.ConflictException('Variant with this SKU already exists');
            }
        }
        if (updateVariantDto.barcode) {
            const existingBarcode = await this.prisma.productVariant.findFirst({
                where: {
                    barcode: updateVariantDto.barcode,
                    id: { not: id }
                },
            });
            if (existingBarcode) {
                this.logger.warn(`Variant with barcode ${updateVariantDto.barcode} already exists`);
                throw new common_1.ConflictException('Variant with this barcode already exists');
            }
        }
        const updatedVariant = await this.prisma.productVariant.update({
            where: { id },
            data: updateVariantDto,
        });
        this.logger.log(`Variant updated successfully: ${updatedVariant.id}`);
        return updatedVariant;
    }
    async remove(id) {
        this.logger.log(`Deleting variant: ${id}`);
        await this.findOne(id);
        await this.prisma.productVariant.delete({
            where: { id },
        });
        this.logger.log(`Variant deleted successfully: ${id}`);
        return { message: 'Variant deleted successfully' };
    }
    async toggleActive(id) {
        this.logger.log(`Toggling active status for variant: ${id}`);
        const variant = await this.findOne(id);
        const updatedVariant = await this.prisma.productVariant.update({
            where: { id },
            data: { isActive: !variant.isActive },
        });
        this.logger.log(`Variant ${id} is now ${updatedVariant.isActive ? 'active' : 'inactive'}`);
        return updatedVariant;
    }
};
exports.ProductVariantsService = ProductVariantsService;
exports.ProductVariantsService = ProductVariantsService = ProductVariantsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductVariantsService);
//# sourceMappingURL=product-variants.service.js.map