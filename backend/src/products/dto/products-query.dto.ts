import { IsOptional, IsInt, Min, Max, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ProductsQueryDto {
  @ApiProperty({ required: false, default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false, default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({ required: false, description: 'Search by name or SKU' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, description: 'Filter by category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ 
    required: false, 
    description: 'Filter by status',
    enum: ['active', 'inactive', 'all'],
    default: 'all'
  })
  @IsOptional()
  @IsString()
  @IsIn(['active', 'inactive', 'all'])
  status?: string = 'all';

  @ApiProperty({ required: false, description: 'Filter by location ID' })
  @IsOptional()
  @IsString()
  locationId?: string;
}
