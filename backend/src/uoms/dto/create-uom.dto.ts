import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateUOMDto {
  @ApiProperty({ example: 'Kilograms' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'kg' })
  @IsString()
  symbol: string;

  @ApiProperty({ example: 'Weight measurement', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}
