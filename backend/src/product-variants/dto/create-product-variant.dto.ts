import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min, IsBoolean } from 'class-validator';

export class CreateProductVariantDto {
  @ApiProperty({ example: 'Size' })
  @IsString()
  variantName: string;

  @ApiProperty({ example: 'Large' })
  @IsString()
  variantValue: string;

  @ApiProperty({ example: 'LAPTOP-001-L' })
  @IsString()
  sku: string;

  @ApiProperty({ example: '1234567890124', required: false })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiProperty({ example: 50.00, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  additionalPrice?: number;

  @ApiProperty({ example: true, default: true })
  @IsBoolean()
  isActive: boolean = true;
}
