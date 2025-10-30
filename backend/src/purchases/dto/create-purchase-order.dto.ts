import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsDateString, IsEnum, IsArray, ValidateNested, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePurchaseItemDto {
  @ApiProperty({ example: 'uuid-of-product' })
  @IsString()
  @IsUUID()
  productId: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0.01)
  quantity: number;

  @ApiProperty({ example: 25.50 })
  @IsNumber()
  @Min(0)
  costPrice: number;

  @ApiProperty({ example: 35.00 })
  @IsNumber()
  @Min(0)
  retailPrice: number;

  @ApiProperty({ example: '2024-12-31', required: false })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiProperty({ example: 255.00 })
  @IsNumber()
  @Min(0)
  totalPrice: number;
}

export class CreatePurchaseOrderDto {
  @ApiProperty({ example: 'uuid-of-supplier' })
  @IsString()
  @IsUUID()
  supplierId: string;

  @ApiProperty({ example: 'PO-REF-001', required: false })
  @IsOptional()
  @IsString()
  referenceNo?: string;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  orderDate: string;

  @ApiProperty({ example: '2024-01-20', required: false })
  @IsOptional()
  @IsDateString()
  expectedDate?: string;

  @ApiProperty({ example: 'Additional notes about the order', required: false })
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiProperty({ type: [CreatePurchaseItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseItemDto)
  items: CreatePurchaseItemDto[];
}
