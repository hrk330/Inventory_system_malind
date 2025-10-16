import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateLocationDto {
  @ApiProperty({ example: 'Main Warehouse' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'WAREHOUSE', enum: ['WAREHOUSE', 'STORE'] })
  @IsEnum(['WAREHOUSE', 'STORE'])
  type: 'WAREHOUSE' | 'STORE';

  @ApiProperty({ example: '123 Main St, City, State', required: false })
  @IsOptional()
  @IsString()
  address?: string;
}
