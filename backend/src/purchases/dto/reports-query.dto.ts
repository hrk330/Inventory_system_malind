import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsString, IsEnum } from 'class-validator';

export class ReportsQueryDto {
  @ApiProperty({ example: '2024-01-01', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ example: '2024-12-31', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ example: 'uuid-of-supplier', required: false })
  @IsOptional()
  @IsString()
  supplierId?: string;

  @ApiProperty({ example: 'uuid-of-product', required: false })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiProperty({ 
    example: 'PENDING', 
    enum: ['PENDING', 'RECEIVED', 'PARTIAL', 'CANCELLED'],
    required: false 
  })
  @IsOptional()
  @IsEnum(['PENDING', 'RECEIVED', 'PARTIAL', 'CANCELLED'])
  status?: 'PENDING' | 'RECEIVED' | 'PARTIAL' | 'CANCELLED';
}
