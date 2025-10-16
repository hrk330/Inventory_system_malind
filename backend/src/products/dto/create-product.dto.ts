import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min, IsBoolean, IsArray, IsDecimal } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({ example: 'Laptop Computer' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'LAPTOP-001' })
  @IsString()
  sku: string;

  @ApiProperty({ example: 'category-uuid', required: false })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({ example: 'uom-pcs' })
  @IsString()
  uomId: string;

  @ApiProperty({ example: 10, default: 0 })
  @IsNumber()
  @Min(0)
  reorderLevel: number = 0;

  @ApiProperty({ example: 'High-performance laptop for business use', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '1234567890123', required: false })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiProperty({ example: 'supplier-uuid', required: false })
  @IsOptional()
  @IsString()
  supplierId?: string;

  @ApiProperty({ example: 'Tech Supplier Inc.', required: false })
  @IsOptional()
  @IsString()
  supplierName?: string;

  @ApiProperty({ example: 800.00, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  costPrice?: number;

  @ApiProperty({ example: 1200.00, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sellingPrice?: number;

  @ApiProperty({ example: 5, default: 0 })
  @IsNumber()
  @Min(0)
  minStock: number = 0;

  @ApiProperty({ example: 100, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxStock?: number;

  @ApiProperty({ example: true, default: true })
  @IsBoolean()
  isActive: boolean = true;

  @ApiProperty({ example: ['image1.jpg', 'image2.jpg'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

}
