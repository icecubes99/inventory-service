import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { LocationType, LocationStatus } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class SearchLocationsDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Search term for location name',
    example: 'warehouse',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by location type',
    enum: LocationType,
    example: LocationType.WAREHOUSE,
  })
  @IsOptional()
  @IsEnum(LocationType)
  type?: LocationType;

  @ApiPropertyOptional({
    description: 'Filter by location status',
    enum: LocationStatus,
    example: LocationStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(LocationStatus)
  status?: LocationStatus;

  @ApiPropertyOptional({
    description: 'Filter by manager ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsString()
  managerId?: string;

  @ApiPropertyOptional({
    description: 'Filter locations that have a manager assigned',
    example: true,
  })
  @IsOptional()
  hasManager?: boolean;
}
