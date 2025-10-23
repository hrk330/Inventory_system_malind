import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsEnum, IsUUID, IsArray, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { SaleType, DiscountType } from '@prisma/client';
import { CreateSaleItemDto } from './create-sale-item.dto';
import { CreatePaymentDto } from './create-payment.dto';

export class CreateSaleDto {
  @ApiProperty({ example: 'RETAIL', enum: SaleType, description: 'Type of sale' })
  @IsEnum(SaleType)
  saleType: SaleType;

  @ApiProperty({ example: 'uuid-of-customer', description: 'Customer ID (optional)', required: false })
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiProperty({ example: 'uuid-of-location', description: 'Location where sale occurred' })
  @IsUUID()
  locationId: string;

  @ApiProperty({ type: [CreateSaleItemDto], description: 'Sale items' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items: CreateSaleItemDto[];

  @ApiProperty({ type: [CreatePaymentDto], description: 'Payments (optional for draft sales)', required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePaymentDto)
  payments?: CreatePaymentDto[];

  @ApiProperty({ example: 15.00, description: 'Tax rate (%)', required: false, minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  taxRate?: number;

  @ApiProperty({ example: 'PERCENTAGE', enum: DiscountType, description: 'Sale-level discount type', required: false })
  @IsOptional()
  @IsEnum(DiscountType)
  discountType?: DiscountType;

  @ApiProperty({ example: 10.00, description: 'Sale-level discount rate (%) or amount', required: false, minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  discountValue?: number;

  @ApiProperty({ example: 'Internal notes about the sale', description: 'Internal notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: 'Thank you for your purchase!', description: 'Notes visible on receipt', required: false })
  @IsOptional()
  @IsString()
  customerNotes?: string;
}
