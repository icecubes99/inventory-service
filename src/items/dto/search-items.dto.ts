import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ItemStatus } from '@prisma/client';
import { PaginationDto } from '../../common/dto';

export class SearchItemsDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Search query for item code or description',
    example: 'steel',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: ItemStatus,
    description: 'Filter by item status',
    example: ItemStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(ItemStatus)
  status?: ItemStatus;

  @ApiPropertyOptional({
    description: 'Filter by unit of measurement',
    example: 'pieces',
  })
  @IsOptional()
  @IsString()
  unitOfMeasurement?: string;
}
