import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { Location, LocationType, LocationStatus } from '@prisma/client';
import { handlePrismaError } from '../common/utils/prisma-error-handler';

@Injectable()
export class LocationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createLocationDto: CreateLocationDto): Promise<Location> {
    try {
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
  ): Promise<Location> {
    try {
      // Check if location exists
      await this.findOne(id); // This already throws NotFoundException if not found, and is handled by its own try/catch

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
      handlePrismaError(error);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      // Check if location exists
      await this.findOne(id); // This already throws NotFoundException if not found, and is handled by its own try/catch

      // Soft delete
      await this.prisma.location.update({
        where: { id },
        data: {
          deletedAt: new Date(),
        },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async assignUser(locationId: string, userId: string): Promise<Location> {
    try {
      // Check if location exists
      await this.findOne(locationId); // This already throws NotFoundException if not found, and is handled by its own try/catch

      // Check if user exists
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
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
      handlePrismaError(error);
    }
  }

  async unassignUser(locationId: string, userId: string): Promise<Location> {
    try {
      // Check if location exists
      await this.findOne(locationId); // This already throws NotFoundException if not found, and is handled by its own try/catch

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
      handlePrismaError(error);
    }
  }
}
