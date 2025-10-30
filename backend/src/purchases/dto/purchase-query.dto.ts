import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class PurchaseQueryDto extends PaginationDto {
  @ApiProperty({ example: 'Tech Supplier Inc.', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ example: 'uuid-of-supplier', required: false })
  @IsOptional()
  @IsString()
  supplierId?: string;

  @ApiProperty({ 
    example: 'PENDING', 
    enum: ['PENDING', 'RECEIVED', 'PARTIAL', 'CANCELLED'],
    required: false 
  })
  @IsOptional()
  @IsEnum(['PENDING', 'RECEIVED', 'PARTIAL', 'CANCELLED'])
  status?: 'PENDING' | 'RECEIVED' | 'PARTIAL' | 'CANCELLED';

  @ApiProperty({ 
    example: 'PENDING', 
    enum: ['PENDING', 'PARTIAL', 'PAID'],
    required: false 
  })
  @IsOptional()
  @IsEnum(['PENDING', 'PARTIAL', 'PAID'])
  paymentStatus?: 'PENDING' | 'PARTIAL' | 'PAID';

  @ApiProperty({ example: '2024-01-01', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ example: '2024-01-31', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
