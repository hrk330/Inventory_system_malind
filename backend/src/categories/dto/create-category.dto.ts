import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, MaxLength, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ 
    example: 'Electronics',
    description: 'Category name (must be unique)'
  })
  @IsString()
  @MinLength(2, { message: 'Category name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Category name must not exceed 100 characters' })
  name: string;

  @ApiProperty({ 
    example: 'Electronic devices and accessories',
    description: 'Category description',
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Description must not exceed 500 characters' })
  description?: string;

  @ApiProperty({ 
    example: 'https://example.com/category-image.jpg',
    description: 'Category image URL',
    required: false
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ 
    example: true,
    description: 'Whether the category is active',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}
