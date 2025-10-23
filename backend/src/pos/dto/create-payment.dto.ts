import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsEnum, Min, MaxLength } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class CreatePaymentDto {
  @ApiProperty({ example: 'CASH', enum: PaymentMethod, description: 'Payment method' })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ example: 100.00, description: 'Payment amount', minimum: 0.01 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;

  @ApiProperty({ example: 'AUTH123456', description: 'Reference number (auth code, transaction ID, etc.)', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  referenceNumber?: string;

  @ApiProperty({ example: '1234', description: 'Last 4 digits of card', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(4)
  cardLastFour?: string;

  @ApiProperty({ example: 'Visa', description: 'Card type', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  cardType?: string;

  @ApiProperty({ example: 'Chase Bank', description: 'Bank name for transfers', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  bankName?: string;

  @ApiProperty({ example: 'CHK001234', description: 'Cheque number', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  chequeNumber?: string;

  @ApiProperty({ example: 'Payment processed successfully', description: 'Payment notes', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  notes?: string;
}
