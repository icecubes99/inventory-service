import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ItemStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateItemDto {
  @ApiProperty({
    example: 'ITM-001',
    description: 'Unique code for the item',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    example: 'Steel Rebar 12mm',
    description: 'Description of the item',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: 'pieces',
    description: 'Unit of measurement (e.g., pieces, kg, meters, liters)',
  })
  @IsString()
  @IsNotEmpty()
  unitOfMeasurement: string;

  @ApiProperty({
    enum: ItemStatus,
    example: ItemStatus.ACTIVE,
    required: false,
    description: 'Status of the item',
  })
  @IsEnum(ItemStatus)
  @IsOptional()
  status?: ItemStatus;
}
