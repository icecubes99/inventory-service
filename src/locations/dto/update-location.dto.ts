import { PartialType } from '@nestjs/mapped-types';
import { CreateLocationDto } from './create-location.dto';
import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateLocationDto extends PartialType(CreateLocationDto) {
  @ApiProperty({
    example: 'new-manager-uuid-string',
    required: false,
    description: 'The new ID of the manager for this location',
  })
  @IsString()
  @IsOptional()
  managerId?: string;

  // Note: assignedUserId is removed as per our previous discussion to handle user assignment via dedicated endpoints.
  // If you still need it here for some reason, uncomment and add @ApiProperty.
  // @ApiProperty({ example: 'user-to-assign-uuid', required: false, description: 'The ID of the user to be assigned to this location' })
  // @IsString()
  // @IsOptional()
  // assignedUserId?: string;
}
