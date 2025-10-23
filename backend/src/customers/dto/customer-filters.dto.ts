import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class CustomerFiltersDto extends PaginationDto {
  @ApiProperty({ example: 'John', description: 'Search by name, email, or phone', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ example: true, description: 'Filter by active status', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
