import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min, IsOptional, IsString, IsEnum } from 'class-validator';
import { PaymentStatus } from '@prisma/client';

export class UpdatePaymentDto {
  @ApiProperty({ 
    example: 500.00, 
    description: 'Amount being paid in this transaction' 
  })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ 
    example: 'PAID', 
    enum: PaymentStatus,
    description: 'Payment status after this payment' 
  })
  @IsEnum(PaymentStatus)
  paymentStatus: PaymentStatus;

  @ApiProperty({ 
    example: 'Bank transfer - Ref: TXN123456', 
    required: false,
    description: 'Payment reference or notes' 
  })
  @IsOptional()
  @IsString()
  paymentReference?: string;

  @ApiProperty({ 
    example: 'Payment received via bank transfer', 
    required: false,
    description: 'Additional payment notes' 
  })
  @IsOptional()
  @IsString()
  paymentNotes?: string;
}
