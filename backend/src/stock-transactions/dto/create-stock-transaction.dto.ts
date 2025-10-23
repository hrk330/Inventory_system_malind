import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsEnum, Min, IsUUID } from 'class-validator';

export class CreateStockTransactionDto {
  @ApiProperty({ example: 'uuid-of-product' })
  @IsString()
  @IsUUID()
  productId: string;

  @ApiProperty({ example: 'uuid-of-from-location', required: false })
  @IsOptional()
  @IsString()
  @IsUUID()
  fromLocationId?: string;

  @ApiProperty({ example: 'uuid-of-to-location', required: false })
  @IsOptional()
  @IsString()
  @IsUUID()
  toLocationId?: string;

  @ApiProperty({ 
    example: 'RECEIPT', 
    enum: ['RECEIPT', 'ISSUE', 'TRANSFER', 'ADJUSTMENT'] 
  })
  @IsEnum(['RECEIPT', 'ISSUE', 'TRANSFER', 'ADJUSTMENT'])
  type: 'RECEIPT' | 'ISSUE' | 'TRANSFER' | 'ADJUSTMENT';

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0.01)
  quantity: number;

  @ApiProperty({ example: 'REF-001', required: false })
  @IsOptional()
  @IsString()
  referenceNo?: string;

  @ApiProperty({ example: 'Stock received from supplier', required: false })
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiProperty({ example: 'uuid-of-sale', description: 'Sale ID for POS transactions', required: false })
  @IsOptional()
  @IsString()
  @IsUUID()
  saleId?: string;
}
