import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsDateString } from 'class-validator';

export class CustomerLedgerQueryDto {
  @ApiProperty({ 
    example: '2024-01-01', 
    required: false,
    description: 'Start date for filtering transactions (YYYY-MM-DD format)'
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ 
    example: '2024-12-31', 
    required: false,
    description: 'End date for filtering transactions (YYYY-MM-DD format)'
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
