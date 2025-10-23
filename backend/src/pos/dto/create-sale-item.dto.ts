import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsEnum, IsUUID, Min, Max } from 'class-validator';
import { ItemType, DiscountType } from '@prisma/client';

export class CreateSaleItemDto {
  @ApiProperty({ example: 'uuid-of-product', description: 'Product ID (required for PRODUCT type)', required: false })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @ApiProperty({ example: 'PRODUCT', enum: ItemType, description: 'Type of item' })
  @IsEnum(ItemType)
  itemType: ItemType;

  @ApiProperty({ example: 'iPhone 15 Pro', description: 'Item name' })
  @IsString()
  itemName: string;

  @ApiProperty({ example: 'Latest iPhone model', description: 'Item description', required: false })
  @IsOptional()
  @IsString()
  itemDescription?: string;

  @ApiProperty({ example: 'IPH15P-001', description: 'SKU for products', required: false })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiProperty({ example: '1234567890123', description: 'Barcode for products', required: false })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiProperty({ example: 1.5, description: 'Quantity', minimum: 0.001 })
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.001)
  quantity: number;

  @ApiProperty({ example: 999.99, description: 'Unit price', minimum: 0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  unitPrice: number;

  @ApiProperty({ example: 50.00, description: 'Cost price for profit calculation', required: false, minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  costPrice?: number;

  @ApiProperty({ example: 15.00, description: 'Item-specific tax rate (%)', required: false, minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  itemTaxRate?: number;

  @ApiProperty({ example: 'PERCENTAGE', enum: DiscountType, description: 'Item discount type', required: false })
  @IsOptional()
  @IsEnum(DiscountType)
  itemDiscountType?: DiscountType;

  @ApiProperty({ example: 10.00, description: 'Item discount rate (%) or amount', required: false, minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  itemDiscountRate?: number;

  @ApiProperty({ example: 'Customer requested discount', description: 'Item notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
