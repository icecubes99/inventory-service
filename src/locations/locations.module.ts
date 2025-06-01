import { Module } from '@nestjs/common';
import { LocationsController } from './locations.controller';
import { LocationsService } from './locations.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PermissionsService } from '../auth/permissions.service';
import { UserService } from '../user/user.service';

@Module({
  imports: [PrismaModule],
  controllers: [LocationsController],
  providers: [LocationsService, PermissionsService, UserService],
})
export class LocationsModule {}
