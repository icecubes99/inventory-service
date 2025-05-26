import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignUserDto {
  @ApiProperty({
    example: 'user-uuid-to-assign',
    description: 'The ID of the user to assign to the location',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;
}
