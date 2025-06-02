import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { Item, ItemStatus, Role } from '@prisma/client';
import { handlePrismaError } from '../common/utils/prisma-error-handler';

@Injectable()
export class ItemsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createItemDto: CreateItemDto,
    actorUserId: string,
  ): Promise<Item> {
    try {
      // Check if actor has permission to create items
      const actor = await this.prisma.user.findFirst({
        where: { id: actorUserId, deletedAt: null },
      });

      if (!actor) {
        throw new ForbiddenException('Invalid user.');
      }

      const allowedRoles: Role[] = [
        Role.ADMIN,
        Role.WAREHOUSE_MANAGER,
        Role.INVENTORY_MASTER,
      ];
      if (!allowedRoles.includes(actor.role)) {
        throw new ForbiddenException(
          'You do not have permission to create items.',
        );
      }

      // Check if item code already exists
      const existingItem = await this.prisma.item.findFirst({
        where: {
          code: createItemDto.code,
          deletedAt: null,
        },
      });

      if (existingItem) {
        throw new ConflictException(
          `Item with code '${createItemDto.code}' already exists.`,
        );
      }

      return await this.prisma.item.create({
        data: {
          code: createItemDto.code,
          description: createItemDto.description,
          unitOfMeasurement: createItemDto.unitOfMeasurement,
          status: createItemDto.status || ItemStatus.ACTIVE,
        },
        include: {
          _count: {
            select: {
              mrfLineItems: true,
              poLineItems: true,
              drLineItems: true,
              inventoryItems: true,
            },
          },
        },
      });
    } catch (error) {
      if (
        error instanceof ForbiddenException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      handlePrismaError(error);
    }
  }

  async findAll(): Promise<Item[]> {
    try {
      return await this.prisma.item.findMany({
        where: {
          deletedAt: null,
        },
        include: {
          _count: {
            select: {
              mrfLineItems: true,
              poLineItems: true,
              drLineItems: true,
              inventoryItems: true,
            },
          },
        },
        orderBy: {
          code: 'asc',
        },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findOne(id: string): Promise<Item> {
    try {
      const item = await this.prisma.item.findFirst({
        where: {
          id,
          deletedAt: null,
        },
        include: {
          inventoryItems: {
            include: {
              location: {
                select: {
                  id: true,
                  name: true,
                  type: true,
                },
              },
            },
          },
          _count: {
            select: {
              mrfLineItems: true,
              poLineItems: true,
              drLineItems: true,
            },
          },
        },
      });

      if (!item) {
        throw new NotFoundException(`Item with ID ${id} not found`);
      }

      return item;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      handlePrismaError(error);
    }
  }

  async findByCode(code: string): Promise<Item> {
    try {
      const item = await this.prisma.item.findFirst({
        where: {
          code,
          deletedAt: null,
        },
        include: {
          inventoryItems: {
            include: {
              location: {
                select: {
                  id: true,
                  name: true,
                  type: true,
                },
              },
            },
          },
          _count: {
            select: {
              mrfLineItems: true,
              poLineItems: true,
              drLineItems: true,
            },
          },
        },
      });

      if (!item) {
        throw new NotFoundException(`Item with code '${code}' not found`);
      }

      return item;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      handlePrismaError(error);
    }
  }

  async findByStatus(status: ItemStatus): Promise<Item[]> {
    try {
      return await this.prisma.item.findMany({
        where: {
          status,
          deletedAt: null,
        },
        include: {
          _count: {
            select: {
              mrfLineItems: true,
              poLineItems: true,
              drLineItems: true,
              inventoryItems: true,
            },
          },
        },
        orderBy: {
          code: 'asc',
        },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async search(query: string): Promise<Item[]> {
    try {
      return await this.prisma.item.findMany({
        where: {
          deletedAt: null,
          OR: [
            {
              code: {
                contains: query,
                mode: 'insensitive',
              },
            },
            {
              description: {
                contains: query,
                mode: 'insensitive',
              },
            },
          ],
        },
        include: {
          _count: {
            select: {
              mrfLineItems: true,
              poLineItems: true,
              drLineItems: true,
              inventoryItems: true,
            },
          },
        },
        orderBy: {
          code: 'asc',
        },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async update(
    id: string,
    updateItemDto: UpdateItemDto,
    actorUserId: string,
  ): Promise<Item> {
    try {
      // Check if actor has permission to update items
      const actor = await this.prisma.user.findFirst({
        where: { id: actorUserId, deletedAt: null },
      });

      if (!actor) {
        throw new ForbiddenException('Invalid user.');
      }

      const allowedRoles: Role[] = [
        Role.ADMIN,
        Role.WAREHOUSE_MANAGER,
        Role.INVENTORY_MASTER,
      ];
      if (!allowedRoles.includes(actor.role)) {
        throw new ForbiddenException(
          'You do not have permission to update items.',
        );
      }

      // Check if item exists
      await this.findOne(id);

      // Check if new code conflicts with existing items (if code is being updated)
      if (updateItemDto.code) {
        const existingItem = await this.prisma.item.findFirst({
          where: {
            code: updateItemDto.code,
            deletedAt: null,
            NOT: { id },
          },
        });

        if (existingItem) {
          throw new ConflictException(
            `Item with code '${updateItemDto.code}' already exists.`,
          );
        }
      }

      return await this.prisma.item.update({
        where: { id },
        data: {
          code: updateItemDto.code,
          description: updateItemDto.description,
          unitOfMeasurement: updateItemDto.unitOfMeasurement,
          status: updateItemDto.status,
        },
        include: {
          _count: {
            select: {
              mrfLineItems: true,
              poLineItems: true,
              drLineItems: true,
              inventoryItems: true,
            },
          },
        },
      });
    } catch (error) {
      if (
        error instanceof ForbiddenException ||
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      handlePrismaError(error);
    }
  }

  async remove(id: string, actorUserId: string): Promise<void> {
    try {
      // Check if actor has permission to delete items
      const actor = await this.prisma.user.findFirst({
        where: { id: actorUserId, deletedAt: null },
      });

      if (!actor) {
        throw new ForbiddenException('Invalid user.');
      }

      const allowedRoles: Role[] = [Role.ADMIN, Role.WAREHOUSE_MANAGER];
      if (!allowedRoles.includes(actor.role)) {
        throw new ForbiddenException(
          'You do not have permission to delete items.',
        );
      }

      // Check if item exists
      const item = await this.findOne(id);

      // Check if item is being used in any documents or inventory
      const usageCount = await this.prisma.item.findFirst({
        where: { id },
        select: {
          _count: {
            select: {
              mrfLineItems: true,
              poLineItems: true,
              drLineItems: true,
              inventoryItems: {
                where: {
                  quantity: {
                    gt: 0,
                  },
                },
              },
            },
          },
        },
      });

      if (!usageCount) {
        throw new NotFoundException('Item not found for usage check.');
      }

      const totalUsage =
        usageCount._count.mrfLineItems +
        usageCount._count.poLineItems +
        usageCount._count.drLineItems +
        usageCount._count.inventoryItems;

      if (totalUsage > 0) {
        throw new ForbiddenException(
          `Item '${item.description}' cannot be deleted as it is being used in documents or has inventory. Consider marking it as inactive instead.`,
        );
      }

      await this.prisma.item.update({
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
}
