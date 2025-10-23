import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsUUID, IsDateString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { SaleStatus, PaymentStatus, SaleType } from '@prisma/client';

export class SaleFiltersDto extends PaginationDto {
  @ApiProperty({ example: '2024-01-01', description: 'Start date (ISO string)', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ example: '2024-01-31', description: 'End date (ISO string)', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ example: 'uuid-of-location', description: 'Filter by location', required: false })
  @IsOptional()
  @IsUUID()
  locationId?: string;

  @ApiProperty({ example: 'uuid-of-customer', description: 'Filter by customer', required: false })
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiProperty({ example: 'uuid-of-user', description: 'Filter by user who created sale', required: false })
  @IsOptional()
  @IsUUID()
  createdBy?: string;

  @ApiProperty({ example: 'COMPLETED', enum: SaleStatus, description: 'Filter by sale status', required: false })
  @IsOptional()
  @IsEnum(SaleStatus)
  status?: SaleStatus;

  @ApiProperty({ example: 'PAID', enum: PaymentStatus, description: 'Filter by payment status', required: false })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @ApiProperty({ example: 'RETAIL', enum: SaleType, description: 'Filter by sale type', required: false })
  @IsOptional()
  @IsEnum(SaleType)
  saleType?: SaleType;

  @ApiProperty({ example: 'POS-20240101-0001', description: 'Search by sale number', required: false })
  @IsOptional()
  @IsString()
  saleNumber?: string;
}
