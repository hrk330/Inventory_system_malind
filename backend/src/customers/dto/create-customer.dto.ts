import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, MinLength, MaxLength, IsBoolean } from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({ example: 'John Doe', description: 'Customer full name' })
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name: string;

  @ApiProperty({ example: 'john.doe@example.com', description: 'Customer email address', required: false })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @ApiProperty({ example: '+1234567890', description: 'Customer phone number', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20, { message: 'Phone number must not exceed 20 characters' })
  phone?: string;

  @ApiProperty({ example: '123 Main Street', description: 'Customer address', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Address must not exceed 200 characters' })
  address?: string;

  @ApiProperty({ example: 'New York', description: 'Customer city', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'City must not exceed 50 characters' })
  city?: string;

  @ApiProperty({ example: '10001', description: 'Postal/ZIP code', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20, { message: 'Postal code must not exceed 20 characters' })
  postalCode?: string;

  @ApiProperty({ example: 'VIP customer, prefers morning deliveries', description: 'Additional notes about customer', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Notes must not exceed 500 characters' })
  notes?: string;

  @ApiProperty({ example: true, description: 'Whether the customer is active', required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
