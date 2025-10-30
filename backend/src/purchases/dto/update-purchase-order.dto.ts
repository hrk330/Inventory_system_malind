import { PartialType } from '@nestjs/swagger';
import { CreatePurchaseOrderDto } from './create-purchase-order.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsNumber, Min } from 'class-validator';

export class UpdatePurchaseOrderDto extends PartialType(CreatePurchaseOrderDto) {
  @ApiProperty({ 
    example: 'PENDING', 
    enum: ['PENDING', 'RECEIVED', 'PARTIAL', 'CANCELLED'],
    required: false 
  })
  @IsOptional()
  @IsEnum(['PENDING', 'RECEIVED', 'PARTIAL', 'CANCELLED'])
  status?: 'PENDING' | 'RECEIVED' | 'PARTIAL' | 'CANCELLED';

  @ApiProperty({ example: 500.00, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amountPaid?: number;

  @ApiProperty({ 
    example: 'PENDING', 
    enum: ['PENDING', 'PARTIAL', 'PAID'],
    required: false 
  })
  @IsOptional()
  @IsEnum(['PENDING', 'PARTIAL', 'PAID'])
  paymentStatus?: 'PENDING' | 'PARTIAL' | 'PAID';
}
