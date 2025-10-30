import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsArray, ValidateNested, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePurchaseReturnItemDto {
  @ApiProperty({ example: 'uuid-of-product' })
  @IsString()
  @IsUUID()
  productId: string;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(0.01)
  quantity: number;

  @ApiProperty({ example: 25.50 })
  @IsNumber()
  @Min(0)
  costPrice: number;

  @ApiProperty({ example: 127.50 })
  @IsNumber()
  @Min(0)
  totalPrice: number;

  @ApiProperty({ example: 'Defective product', required: false })
  @IsString()
  reason?: string;
}

export class CreatePurchaseReturnDto {
  @ApiProperty({ example: 'uuid-of-purchase-order' })
  @IsString()
  @IsUUID()
  purchaseOrderId: string;

  @ApiProperty({ example: 'uuid-of-supplier' })
  @IsString()
  @IsUUID()
  supplierId: string;

  @ApiProperty({ example: 'Defective products received' })
  @IsString()
  reason: string;

  @ApiProperty({ example: 'Additional notes about the return', required: false })
  @IsString()
  remarks?: string;

  @ApiProperty({ type: [CreatePurchaseReturnItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseReturnItemDto)
  items: CreatePurchaseReturnItemDto[];
}
