import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { SearchLocationsDto } from './dto/search-locations.dto';
import { Location, LocationType, LocationStatus, Prisma } from '@prisma/client';
import { handlePrismaError } from '../common/utils/prisma-error-handler';
import { PermissionsService } from '../auth/permissions.service';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';

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

  async findAllPaginated(
    searchDto: SearchLocationsDto,
  ): Promise<PaginatedResponse<Location>> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        type,
        status,
        managerId,
        hasManager,
      } = searchDto;
      const skip = (page - 1) * limit;

      // Build where clause
      const where: Prisma.LocationWhereInput = {
        deletedAt: null,
        ...(search && {
          name: { contains: search, mode: 'insensitive' },
        }),
        ...(type && { type }),
        ...(status && { status }),
        ...(managerId && { managerId }),
        ...(hasManager !== undefined && {
          managerId: hasManager ? { not: null } : null,
        }),
      };

      const include = {
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
      };

      // Execute queries in parallel
      const [locations, total] = await Promise.all([
        this.prisma.location.findMany({
          where,
          include,
          skip,
          take: limit,
          orderBy: { name: 'asc' },
        }),
        this.prisma.location.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: locations,
        meta: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      };
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

      const userToAssign = await this.prisma.user.findFirst({
        where: { id: userId, deletedAt: null },
      });

      if (!userToAssign) {
        throw new NotFoundException(
          `User with ID ${userId} to assign not found`,
        );
      }

      // Check if user is already assigned to this location
      const existingAssignment = await this.prisma.location.findFirst({
        where: {
          id: locationId,
          assignedUsers: {
            some: {
              id: userId,
            },
          },
        },
      });

      if (existingAssignment) {
        throw new ForbiddenException(
          `User with ID ${userId} is already assigned to this location.`,
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

      // Check if the user exists first
      const userExists = await this.prisma.user.findFirst({
        where: { id: userId, deletedAt: null },
      });

      if (!userExists) {
        throw new NotFoundException(`User with ID ${userId} not found.`);
      }

      // Check if the user is actually assigned to this location
      const locationWithUser = await this.prisma.location.findFirst({
        where: {
          id: locationId,
          assignedUsers: {
            some: {
              id: userId,
            },
          },
        },
      });

      if (!locationWithUser) {
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
