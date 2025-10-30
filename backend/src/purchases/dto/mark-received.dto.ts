import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ReceivedItemDto {
  @ApiProperty({ example: 'uuid-of-purchase-item' })
  @IsString()
  itemId: string;

  @ApiProperty({ example: 10 })
  @IsString()
  receivedQuantity: string;

  @ApiProperty({ example: 'Good condition', required: false })
  @IsOptional()
  @IsString()
  remarks?: string;
}

export class MarkReceivedDto {
  @ApiProperty({ 
    type: [ReceivedItemDto],
    description: 'Items received with quantities',
    required: false 
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReceivedItemDto)
  receivedItems?: ReceivedItemDto[];

  @ApiProperty({ example: 'All items received in good condition', required: false })
  @IsOptional()
  @IsString()
  remarks?: string;
}
