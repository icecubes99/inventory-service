import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { LocationType, LocationStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLocationDto {
  @ApiProperty({
    example: 'Main Warehouse',
    description: 'The name of the location',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    enum: LocationType,
    example: LocationType.WAREHOUSE,
    description: 'The type of the location',
  })
  @IsEnum(LocationType)
  @IsNotEmpty()
  type: LocationType;

  @ApiProperty({
    enum: LocationStatus,
    example: LocationStatus.ACTIVE,
    required: false,
    description: 'The status of the location',
  })
  @IsEnum(LocationStatus)
  @IsOptional()
  status?: LocationStatus;

  @ApiProperty({
    example: 'user-uuid-string',
    required: false,
    description: 'The ID of the manager for this location',
  })
  @IsString()
  @IsOptional()
  managerId?: string;
}
