import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { LocationType, LocationStatus } from '@prisma/client';

export class CreateLocationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(LocationType)
  @IsNotEmpty()
  type: LocationType;

  @IsEnum(LocationStatus)
  @IsOptional()
  status?: LocationStatus;
}
