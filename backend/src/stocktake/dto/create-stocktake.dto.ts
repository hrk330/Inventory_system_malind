import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, Min, IsUUID, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateStocktakeDto {
  @ApiProperty({ example: 'uuid-of-product' })
  @IsString()
  @IsUUID()
  productId: string;

  @ApiProperty({ example: 'uuid-of-location' })
  @IsString()
  @IsUUID()
  locationId: string;

  @ApiProperty({ example: 50 })
  @Transform(({ value }) => Number(value))
  @IsNumber({}, { message: 'Counted quantity must be a number' })
  @Min(0, { message: 'Counted quantity must be greater than or equal to 0' })
  countedQuantity: number;

  @ApiProperty({ example: 'Stock count notes', required: false })
  @IsOptional()
  @IsString()
  remarks?: string;
}
