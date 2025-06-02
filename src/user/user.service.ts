import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SearchUsersDto } from './dto/search-users.dto';
import { User, Location, Role, Prisma } from '@prisma/client';
import { handlePrismaError } from '../common/utils/prisma-error-handler';
import { PermissionsService } from '../auth/permissions.service';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly permissionsService: PermissionsService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { password, ...rest } = createUserDto;
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    try {
      const user = await this.prisma.user.create({
        data: {
          passwordHash: hashedPassword,
          ...rest,
        },
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          locationId: true,
          deletedAt: true,
          // Exclude passwordHash
        },
      });

      if (!user) {
        throw new Error('User not created');
      }

      return user as User;
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findByUsername(username: string): Promise<User> {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          username,
          deletedAt: null,
        },
      });

      if (!user) {
        throw new NotFoundException(`User with username ${username} not found`);
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      handlePrismaError(error);
    }
  }

  async findAll(): Promise<User[]> {
    try {
      return (await this.prisma.user.findMany({
        where: {
          deletedAt: null,
        },
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          locationId: true,
          deletedAt: true,
          // Exclude passwordHash
        },
      })) as User[];
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findAllPaginated(
    searchDto: SearchUsersDto,
  ): Promise<PaginatedResponse<User>> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        role,
        status,
        locationId,
      } = searchDto;
      const skip = (page - 1) * limit;

      // Build where clause
      const where: Prisma.UserWhereInput = {
        deletedAt: null,
        ...(search && {
          OR: [
            { username: { contains: search, mode: 'insensitive' } },
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(role && { role }),
        ...(status && { status }),
        ...(locationId && { locationId }),
      };

      const select = {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        locationId: true,
        deletedAt: true,
        // Exclude passwordHash
      };

      // Execute queries in parallel
      const [users, total] = await Promise.all([
        this.prisma.user.findMany({
          where,
          select,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.user.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: users as User[],
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

  async findOne(id: string): Promise<User> {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          id,
          deletedAt: null,
        },
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          locationId: true,
          deletedAt: true,
          // Exclude passwordHash
        },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      return user as User;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      handlePrismaError(error);
    }
  }

  async getUserWithManagedLocations(
    userId: string,
  ): Promise<User & { managedLocations: Location[] }> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          managedLocations: {
            where: { deletedAt: null },
            select: {
              id: true,
              name: true,
              type: true,
              status: true,
            },
          },
        },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      return user as User & { managedLocations: Location[] };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      handlePrismaError(error);
    }
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    actorUserId?: string,
  ): Promise<User> {
    // Check if we have actor info and verify they exist and are not deleted
    if (actorUserId) {
      const actor = await this.prisma.user.findFirst({
        where: { id: actorUserId, deletedAt: null },
      });

      if (!actor) {
        throw new ForbiddenException('Invalid actor user.');
      }

      // Only ADMIN can change roles
      if (updateUserDto.role && actor.role !== Role.ADMIN) {
        throw new ForbiddenException('Only ADMIN can change user roles.');
      }

      // Non-admin users can only update themselves (except for role changes)
      if (actor.role !== Role.ADMIN && actorUserId !== id) {
        throw new ForbiddenException('You can only update your own profile.');
      }
    }

    try {
      await this.findOne(id);

      const { password, ...otherUpdateData } = updateUserDto;
      const updateData: Prisma.UserUpdateInput = { ...otherUpdateData };

      if (password) {
        const salt = await bcrypt.genSalt();
        updateData.passwordHash = await bcrypt.hash(password, salt);
      }

      // Only include role if it's being updated and allowed
      if (updateUserDto.role) {
        updateData.role = updateUserDto.role;
      } else {
        delete updateData.role;
      }

      return (await this.prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          locationId: true,
          deletedAt: true,
          // Exclude passwordHash
        },
      })) as User;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      )
        throw error;
      handlePrismaError(error);
    }
  }

  async remove(id: string, actorUserId: string): Promise<User> {
    const actor = await this.prisma.user.findUnique({
      where: { id: actorUserId, deletedAt: null },
    });
    if (actor?.role !== Role.ADMIN && id !== actorUserId) {
      throw new ForbiddenException(
        'You do not have permission to delete this user.',
      );
    }
    try {
      const userToDelete = await this.findOne(id);
      const managedLocationsCount = await this.prisma.location.count({
        where: { managerId: id, deletedAt: null },
      });
      if (managedLocationsCount > 0) {
        throw new ForbiddenException(
          `User ${userToDelete.name} cannot be deleted as they manage ${managedLocationsCount} active location(s). Reassign managers first.`,
        );
      }

      return await this.prisma.user.update({
        where: { id },
        data: {
          deletedAt: new Date(),
        },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      )
        throw error;
      handlePrismaError(error);
    }
  }

  async assignManagerToLocation(
    locationId: string,
    managerUserId: string,
    actorUserId: string,
  ): Promise<Location> {
    try {
      const canActorManageLocation =
        await this.permissionsService.canManageLocation(
          actorUserId,
          locationId,
        );
      const actorIsAdmin =
        (
          await this.prisma.user.findFirst({
            where: { id: actorUserId, deletedAt: null },
          })
        )?.role === Role.ADMIN;

      if (!canActorManageLocation && !actorIsAdmin) {
        throw new ForbiddenException(
          'You do not have permission to assign a manager to this location.',
        );
      }

      const location = await this.prisma.location.findUnique({
        where: { id: locationId, deletedAt: null },
      });
      if (!location) {
        throw new NotFoundException(
          `Location with ID ${locationId} not found or is deleted.`,
        );
      }

      const managerUser = await this.prisma.user.findFirst({
        where: { id: managerUserId, deletedAt: null },
      });
      if (!managerUser) {
        throw new NotFoundException(
          `User with ID ${managerUserId} (to be manager) not found.`,
        );
      }

      return await this.prisma.location.update({
        where: { id: locationId },
        data: { managerId: managerUserId },
        include: { manager: true },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      )
        throw error;
      handlePrismaError(error);
    }
  }

  async removeManagerFromLocation(
    locationId: string,
    actorUserId: string,
  ): Promise<Location> {
    try {
      const canActorManageLocation =
        await this.permissionsService.canManageLocation(
          actorUserId,
          locationId,
        );
      const actorIsAdmin =
        (
          await this.prisma.user.findFirst({
            where: { id: actorUserId, deletedAt: null },
          })
        )?.role === Role.ADMIN;

      if (!canActorManageLocation && !actorIsAdmin) {
        throw new ForbiddenException(
          'You do not have permission to remove the manager from this location.',
        );
      }

      const location = await this.prisma.location.findUnique({
        where: { id: locationId, deletedAt: null },
      });
      if (!location) {
        throw new NotFoundException(
          `Location with ID ${locationId} not found or is deleted.`,
        );
      }
      if (!location.managerId) {
        return location;
      }

      return await this.prisma.location.update({
        where: { id: locationId },
        data: { managerId: null },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      )
        throw error;
      handlePrismaError(error);
    }
  }
}
