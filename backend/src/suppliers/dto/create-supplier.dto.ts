import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, IsBoolean, ValidateIf } from 'class-validator';

export class CreateSupplierDto {
  @ApiProperty({ example: 'Tech Supplier Inc.' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsOptional()
  @ValidateIf((o) => o.contactPerson && o.contactPerson.trim() !== '')
  @IsString()
  contactPerson?: string;

  @ApiProperty({ example: 'contact@techsupplier.com', required: false })
  @IsOptional()
  @ValidateIf((o) => o.email && o.email.trim() !== '')
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @ApiProperty({ example: '+1-555-0123', required: false })
  @IsOptional()
  @ValidateIf((o) => o.phone && o.phone.trim() !== '')
  @IsString()
  phone?: string;

  @ApiProperty({ example: '123 Business St, City, State 12345', required: false })
  @IsOptional()
  @ValidateIf((o) => o.address && o.address.trim() !== '')
  @IsString()
  address?: string;

  @ApiProperty({ example: true, default: true })
  @IsBoolean()
  isActive: boolean = true;
}
