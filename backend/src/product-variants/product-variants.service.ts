import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';

@Injectable()
export class ProductVariantsService {
  private readonly logger = new Logger(ProductVariantsService.name);

  constructor(private prisma: PrismaService) {}

  async create(productId: string, createVariantDto: CreateProductVariantDto) {
    this.logger.log(`Creating variant for product: ${productId}`);
    
    // Check if product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      this.logger.warn(`Product not found: ${productId}`);
      throw new NotFoundException('Product not found');
    }

    // Check if SKU already exists
    const existingVariant = await this.prisma.productVariant.findUnique({
      where: { sku: createVariantDto.sku },
    });

    if (existingVariant) {
      this.logger.warn(`Variant with SKU ${createVariantDto.sku} already exists`);
      throw new ConflictException('Variant with this SKU already exists');
    }

    // Check if barcode already exists (if provided)
    if (createVariantDto.barcode) {
      const existingBarcode = await this.prisma.productVariant.findUnique({
        where: { barcode: createVariantDto.barcode },
      });

      if (existingBarcode) {
        this.logger.warn(`Variant with barcode ${createVariantDto.barcode} already exists`);
        throw new ConflictException('Variant with this barcode already exists');
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

  async findAll(productId: string) {
    this.logger.log(`Fetching variants for product: ${productId}`);
    
    // Check if product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      this.logger.warn(`Product not found: ${productId}`);
      throw new NotFoundException('Product not found');
    }

    const variants = await this.prisma.productVariant.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
    });

    this.logger.log(`Found ${variants.length} variants for product ${productId}`);
    return variants;
  }

  async findOne(id: string) {
    this.logger.log(`Fetching variant: ${id}`);
    
    const variant = await this.prisma.productVariant.findUnique({
      where: { id },
      include: { product: true },
    });

    if (!variant) {
      this.logger.warn(`Variant not found: ${id}`);
      throw new NotFoundException('Variant not found');
    }

    this.logger.log(`Variant found: ${variant.id}`);
    return variant;
  }

  async update(id: string, updateVariantDto: UpdateProductVariantDto) {
    this.logger.log(`Updating variant: ${id}`);
    
    // Check if variant exists
    await this.findOne(id);

    // Check if SKU is being changed and if new SKU already exists
    if (updateVariantDto.sku) {
      const existingVariant = await this.prisma.productVariant.findFirst({
        where: { 
          sku: updateVariantDto.sku,
          id: { not: id }
        },
      });

      if (existingVariant) {
        this.logger.warn(`Variant with SKU ${updateVariantDto.sku} already exists`);
        throw new ConflictException('Variant with this SKU already exists');
      }
    }

    // Check if barcode is being changed and if new barcode already exists
    if (updateVariantDto.barcode) {
      const existingBarcode = await this.prisma.productVariant.findFirst({
        where: { 
          barcode: updateVariantDto.barcode,
          id: { not: id }
        },
      });

      if (existingBarcode) {
        this.logger.warn(`Variant with barcode ${updateVariantDto.barcode} already exists`);
        throw new ConflictException('Variant with this barcode already exists');
      }
    }

    const updatedVariant = await this.prisma.productVariant.update({
      where: { id },
      data: updateVariantDto,
    });

    this.logger.log(`Variant updated successfully: ${updatedVariant.id}`);
    return updatedVariant;
  }

  async remove(id: string) {
    this.logger.log(`Deleting variant: ${id}`);
    
    // Check if variant exists
    await this.findOne(id);

    await this.prisma.productVariant.delete({
      where: { id },
    });

    this.logger.log(`Variant deleted successfully: ${id}`);
    return { message: 'Variant deleted successfully' };
  }

  async toggleActive(id: string) {
    this.logger.log(`Toggling active status for variant: ${id}`);
    
    const variant = await this.findOne(id);
    
    const updatedVariant = await this.prisma.productVariant.update({
      where: { id },
      data: { isActive: !variant.isActive },
    });

    this.logger.log(`Variant ${id} is now ${updatedVariant.isActive ? 'active' : 'inactive'}`);
    return updatedVariant;
  }
}
