import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { Location, LocationType, LocationStatus } from '@prisma/client';
import { handlePrismaError } from '../common/utils/prisma-error-handler';
import { PermissionsService } from '../auth/permissions.service';

@Injectable()
export class LocationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly permissionsService: PermissionsService,
  ) {}

  async create(
    createLocationDto: CreateLocationDto,
    actorUserId: string,
  ): Promise<Location> {
    try {
      const canCreate =
        await this.permissionsService.canCreateLocation(actorUserId);
      if (!canCreate) {
        throw new ForbiddenException(
          'You do not have permission to create locations.',
        );
      }

      if (createLocationDto.managerId) {
        const managerExists = await this.prisma.user.findUnique({
          where: { id: createLocationDto.managerId },
        });
        if (!managerExists) {
          throw new NotFoundException(
            `User with ID ${createLocationDto.managerId} (to be manager) not found.`,
          );
        }
      }

      return this.prisma.location.create({
        data: {
          name: createLocationDto.name,
          type: createLocationDto.type,
          status: createLocationDto.status || LocationStatus.ACTIVE,
          managerId: createLocationDto.managerId,
        },
        include: {
          manager: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
              role: true,
            },
          },
          assignedUsers: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
            },
          },
          _count: {
            select: {
              inventory: true,
              MrfsFrom: true,
              DeliveriesTo: true,
              DeliveriesFrom: true,
            },
          },
        },
      });
    } catch (error) {
      if (
        error instanceof ForbiddenException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      handlePrismaError(error);
    }
  }

  async findAll(): Promise<Location[]> {
    try {
      return this.prisma.location.findMany({
        where: {
          deletedAt: null,
        },
        include: {
          manager: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
              role: true,
            },
          },
          assignedUsers: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
            },
          },
          _count: {
            select: {
              inventory: true,
              MrfsFrom: true,
              DeliveriesTo: true,
              DeliveriesFrom: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findOne(id: string): Promise<Location> {
    try {
      const location = await this.prisma.location.findFirst({
        where: {
          id,
          deletedAt: null,
        },
        include: {
          manager: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
              role: true,
            },
          },
          assignedUsers: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
            },
          },
          inventory: {
            include: {
              item: {
                select: {
                  id: true,
                  code: true,
                  description: true,
                  unitOfMeasurement: true,
                },
              },
            },
          },
          _count: {
            select: {
              MrfsFrom: true,
              DeliveriesTo: true,
              DeliveriesFrom: true,
            },
          },
        },
      });

      if (!location) {
        throw new NotFoundException(`Location with ID ${id} not found`);
      }

      return location;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      handlePrismaError(error);
    }
  }

  async findByType(type: LocationType): Promise<Location[]> {
    try {
      return this.prisma.location.findMany({
        where: {
          type,
          deletedAt: null,
        },
        include: {
          manager: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
              role: true,
            },
          },
          assignedUsers: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
            },
          },
          _count: {
            select: {
              inventory: true,
              MrfsFrom: true,
              DeliveriesTo: true,
              DeliveriesFrom: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findByStatus(status: LocationStatus): Promise<Location[]> {
    try {
      return this.prisma.location.findMany({
        where: {
          status,
          deletedAt: null,
        },
        include: {
          manager: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
              role: true,
            },
          },
          assignedUsers: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
            },
          },
          _count: {
            select: {
              inventory: true,
              MrfsFrom: true,
              DeliveriesTo: true,
              DeliveriesFrom: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async update(
    id: string,
    updateLocationDto: UpdateLocationDto,
    actorUserId: string,
  ): Promise<Location> {
    try {
      const canManage = await this.permissionsService.canManageLocation(
        actorUserId,
        id,
      );
      if (!canManage) {
        throw new ForbiddenException(
          'You do not have permission to manage this location.',
        );
      }

      await this.findOne(id);

      if (updateLocationDto.managerId) {
        const managerExists = await this.prisma.user.findUnique({
          where: { id: updateLocationDto.managerId },
        });
        if (!managerExists) {
          throw new NotFoundException(
            `User with ID ${updateLocationDto.managerId} (to be manager) not found.`,
          );
        }
      }

      return this.prisma.location.update({
        where: { id },
        data: {
          name: updateLocationDto.name,
          type: updateLocationDto.type,
          status: updateLocationDto.status,
          managerId: updateLocationDto.managerId,
        },
        include: {
          manager: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
              role: true,
            },
          },
          assignedUsers: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
            },
          },
          _count: {
            select: {
              inventory: true,
              MrfsFrom: true,
              DeliveriesTo: true,
              DeliveriesFrom: true,
            },
          },
        },
      });
    } catch (error) {
      if (
        error instanceof ForbiddenException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      handlePrismaError(error);
    }
  }

  async remove(id: string, actorUserId: string): Promise<void> {
    try {
      const canManage = await this.permissionsService.canManageLocation(
        actorUserId,
        id,
      );
      if (!canManage) {
        throw new ForbiddenException(
          'You do not have permission to manage this location.',
        );
      }
      await this.findOne(id);

      await this.prisma.location.update({
        where: { id },
        data: {
          deletedAt: new Date(),
        },
      });
    } catch (error) {
      if (
        error instanceof ForbiddenException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      handlePrismaError(error);
    }
  }

  async assignUser(
    locationId: string,
    userId: string,
    actorUserId: string,
  ): Promise<Location> {
    try {
      const canManage = await this.permissionsService.canManageLocation(
        actorUserId,
        locationId,
      );
      if (!canManage) {
        throw new ForbiddenException(
          'You do not have permission to manage this location.',
        );
      }

      await this.findOne(locationId);

      const userToAssign = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!userToAssign) {
        throw new NotFoundException(
          `User with ID ${userId} to assign not found`,
        );
      }

      return this.prisma.location.update({
        where: { id: locationId },
        data: {
          assignedUsers: {
            connect: { id: userId },
          },
        },
        include: {
          manager: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
              role: true,
            },
          },
          assignedUsers: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
            },
          },
          _count: {
            select: {
              inventory: true,
              MrfsFrom: true,
              DeliveriesTo: true,
              DeliveriesFrom: true,
            },
          },
        },
      });
    } catch (error) {
      if (
        error instanceof ForbiddenException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      handlePrismaError(error);
    }
  }

  async unassignUser(
    locationId: string,
    userId: string,
    actorUserId: string,
  ): Promise<Location> {
    try {
      const canManage = await this.permissionsService.canManageLocation(
        actorUserId,
        locationId,
      );
      if (!canManage) {
        throw new ForbiddenException(
          'You do not have permission to manage this location.',
        );
      }

      await this.findOne(locationId);

      const userToUnassign = await this.prisma.user.findFirst({
        where: {
          id: userId,
          locationId: locationId,
        },
      });

      if (!userToUnassign) {
        const generalUserCheck = await this.prisma.user.findUnique({
          where: { id: userId },
        });
        if (!generalUserCheck)
          throw new NotFoundException(
            `User with ID ${userId} to unassign not found at all.`,
          );
        throw new NotFoundException(
          `User with ID ${userId} is not assigned to location ${locationId}.`,
        );
      }

      return this.prisma.location.update({
        where: { id: locationId },
        data: {
          assignedUsers: {
            disconnect: { id: userId },
          },
        },
        include: {
          manager: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
              role: true,
            },
          },
          assignedUsers: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
            },
          },
          _count: {
            select: {
              inventory: true,
              MrfsFrom: true,
              DeliveriesTo: true,
              DeliveriesFrom: true,
            },
          },
        },
      });
    } catch (error) {
      if (
        error instanceof ForbiddenException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      handlePrismaError(error);
    }
  }
}
