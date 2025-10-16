import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProductVariantsService } from './product-variants.service';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Product Variants')
@Controller('products/:productId/variants')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProductVariantsController {
  constructor(private readonly productVariantsService: ProductVariantsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product variant' })
  @ApiResponse({ status: 201, description: 'Variant created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 409, description: 'Variant with this SKU or barcode already exists' })
  create(@Param('productId') productId: string, @Body() createVariantDto: CreateProductVariantDto) {
    return this.productVariantsService.create(productId, createVariantDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all variants for a product' })
  @ApiResponse({ status: 200, description: 'Variants retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  findAll(@Param('productId') productId: string) {
    return this.productVariantsService.findAll(productId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get variant by ID' })
  @ApiResponse({ status: 200, description: 'Variant retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Variant not found' })
  findOne(@Param('id') id: string) {
    return this.productVariantsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update variant' })
  @ApiResponse({ status: 200, description: 'Variant updated successfully' })
  @ApiResponse({ status: 404, description: 'Variant not found' })
  @ApiResponse({ status: 409, description: 'Variant with this SKU or barcode already exists' })
  update(@Param('id') id: string, @Body() updateVariantDto: UpdateProductVariantDto) {
    return this.productVariantsService.update(id, updateVariantDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete variant' })
  @ApiResponse({ status: 200, description: 'Variant deleted successfully' })
  @ApiResponse({ status: 404, description: 'Variant not found' })
  remove(@Param('id') id: string) {
    return this.productVariantsService.remove(id);
  }

  @Patch(':id/toggle-active')
  @ApiOperation({ summary: 'Toggle variant active status' })
  @ApiResponse({ status: 200, description: 'Variant status toggled successfully' })
  @ApiResponse({ status: 404, description: 'Variant not found' })
  toggleActive(@Param('id') id: string) {
    return this.productVariantsService.toggleActive(id);
  }
}
