import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, IsBoolean } from 'class-validator';

export class CreateSupplierDto {
  @ApiProperty({ example: 'Tech Supplier Inc.' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsOptional()
  @IsString()
  contactPerson?: string;

  @ApiProperty({ example: 'contact@techsupplier.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '+1-555-0123', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: '123 Business St, City, State 12345', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: true, default: true })
  @IsBoolean()
  isActive: boolean = true;
}
