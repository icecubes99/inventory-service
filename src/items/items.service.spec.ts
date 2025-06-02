import { Test, TestingModule } from '@nestjs/testing';
import { ItemsService } from './items.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { ItemStatus, Role } from '@prisma/client';

describe('ItemsService', () => {
  let service: ItemsService;

  const mockPrismaService = {
    item: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findFirst: jest.fn(),
    },
  };

  const mockUser = {
    id: '1',
    username: 'testuser',
    name: 'Test User',
    email: 'test@example.com',
    role: Role.INVENTORY_MASTER,
    deletedAt: null,
  };

  const mockItem = {
    id: '1',
    code: 'ITM-001',
    description: 'Test Item',
    unitOfMeasurement: 'pieces',
    status: ItemStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    _count: {
      mrfLineItems: 0,
      poLineItems: 0,
      drLineItems: 0,
      inventoryItems: 0,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ItemsService>(ItemsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an item when user has permission', async () => {
      const createItemDto = {
        code: 'ITM-001',
        description: 'Test Item',
        unitOfMeasurement: 'pieces',
        status: ItemStatus.ACTIVE,
      };

      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.item.findFirst.mockResolvedValue(null); // No existing item
      mockPrismaService.item.create.mockResolvedValue(mockItem);

      const result = await service.create(createItemDto, mockUser.id);

      expect(result).toEqual(mockItem);
      expect(mockPrismaService.item.create).toHaveBeenCalledWith({
        data: {
          code: createItemDto.code,
          description: createItemDto.description,
          unitOfMeasurement: createItemDto.unitOfMeasurement,
          status: createItemDto.status,
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
    });

    it('should throw ForbiddenException when user lacks permission', async () => {
      const createItemDto = {
        code: 'ITM-001',
        description: 'Test Item',
        unitOfMeasurement: 'pieces',
      };

      const unauthorizedUser = { ...mockUser, role: Role.ACCOUNTING };
      mockPrismaService.user.findFirst.mockResolvedValue(unauthorizedUser);

      await expect(service.create(createItemDto, mockUser.id)).rejects.toThrow(
        new ForbiddenException('You do not have permission to create items.'),
      );
    });

    it('should throw ConflictException when item code already exists', async () => {
      const createItemDto = {
        code: 'ITM-001',
        description: 'Test Item',
        unitOfMeasurement: 'pieces',
      };

      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.item.findFirst.mockResolvedValue(mockItem); // Existing item

      await expect(service.create(createItemDto, mockUser.id)).rejects.toThrow(
        new ConflictException(
          `Item with code '${createItemDto.code}' already exists.`,
        ),
      );
    });
  });

  describe('findAll', () => {
    it('should return all items', async () => {
      const expectedItems = [mockItem];
      mockPrismaService.item.findMany.mockResolvedValue(expectedItems);

      const result = await service.findAll();

      expect(result).toEqual(expectedItems);
      expect(mockPrismaService.item.findMany).toHaveBeenCalledWith({
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
    });
  });

  describe('findOne', () => {
    it('should return an item when found', async () => {
      const itemWithInventory = {
        ...mockItem,
        inventoryItems: [],
        _count: {
          mrfLineItems: 0,
          poLineItems: 0,
          drLineItems: 0,
        },
      };

      mockPrismaService.item.findFirst.mockResolvedValue(itemWithInventory);

      const result = await service.findOne(mockItem.id);

      expect(result).toEqual(itemWithInventory);
      expect(mockPrismaService.item.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockItem.id,
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
    });

    it('should throw NotFoundException when item not found', async () => {
      mockPrismaService.item.findFirst.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(
        new NotFoundException('Item with ID 999 not found'),
      );
    });
  });

  describe('findByCode', () => {
    it('should return an item when found by code', async () => {
      const itemWithInventory = {
        ...mockItem,
        inventoryItems: [],
        _count: {
          mrfLineItems: 0,
          poLineItems: 0,
          drLineItems: 0,
        },
      };

      mockPrismaService.item.findFirst.mockResolvedValue(itemWithInventory);

      const result = await service.findByCode(mockItem.code);

      expect(result).toEqual(itemWithInventory);
      expect(mockPrismaService.item.findFirst).toHaveBeenCalledWith({
        where: {
          code: mockItem.code,
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
    });

    it('should throw NotFoundException when item not found by code', async () => {
      mockPrismaService.item.findFirst.mockResolvedValue(null);

      await expect(service.findByCode('INVALID')).rejects.toThrow(
        new NotFoundException("Item with code 'INVALID' not found"),
      );
    });
  });

  describe('search', () => {
    it('should return items matching search query', async () => {
      const expectedItems = [mockItem];
      mockPrismaService.item.findMany.mockResolvedValue(expectedItems);

      const result = await service.search('test');

      expect(result).toEqual(expectedItems);
      expect(mockPrismaService.item.findMany).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
          OR: [
            {
              code: {
                contains: 'test',
                mode: 'insensitive',
              },
            },
            {
              description: {
                contains: 'test',
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
    });
  });

  describe('update', () => {
    it('should update an item when user has permission', async () => {
      const updateItemDto = {
        description: 'Updated Test Item',
      };

      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.item.findFirst.mockResolvedValue(mockItem); // Item exists
      mockPrismaService.item.update.mockResolvedValue({
        ...mockItem,
        ...updateItemDto,
      });

      const result = await service.update(
        mockItem.id,
        updateItemDto,
        mockUser.id,
      );

      expect(result).toEqual({ ...mockItem, ...updateItemDto });
      expect(mockPrismaService.item.update).toHaveBeenCalledWith({
        where: { id: mockItem.id },
        data: updateItemDto,
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
    });

    it('should throw ForbiddenException when user lacks permission to update', async () => {
      const updateItemDto = {
        description: 'Updated Test Item',
      };

      const unauthorizedUser = { ...mockUser, role: Role.ACCOUNTING };
      mockPrismaService.user.findFirst.mockResolvedValue(unauthorizedUser);

      await expect(
        service.update(mockItem.id, updateItemDto, mockUser.id),
      ).rejects.toThrow(
        new ForbiddenException('You do not have permission to update items.'),
      );
    });
  });

  describe('remove', () => {
    it('should throw ForbiddenException when user lacks permission to delete', async () => {
      const unauthorizedUser = { ...mockUser, role: Role.INVENTORY_MASTER };
      mockPrismaService.user.findFirst.mockResolvedValue(unauthorizedUser);

      await expect(service.remove(mockItem.id, mockUser.id)).rejects.toThrow(
        new ForbiddenException('You do not have permission to delete items.'),
      );
    });
  });
});
