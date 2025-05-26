import { Test, TestingModule } from '@nestjs/testing';
import { LocationsService } from './locations.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { LocationType, LocationStatus } from '@prisma/client';

describe('LocationsService', () => {
  let service: LocationsService;

  const mockPrismaService = {
    location: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<LocationsService>(LocationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a location', async () => {
      const createLocationDto = {
        name: 'Test Warehouse',
        type: LocationType.WAREHOUSE,
        status: LocationStatus.ACTIVE,
      };

      const expectedLocation = {
        id: '1',
        ...createLocationDto,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        managerId: null,
        manager: null,
        assignedUsers: [],
        _count: {
          inventory: 0,
          MrfsFrom: 0,
          DeliveriesTo: 0,
          DeliveriesFrom: 0,
        },
      };

      mockPrismaService.location.create.mockResolvedValue(expectedLocation);

      const result = await service.create(createLocationDto);

      expect(result).toEqual(expectedLocation);
      expect(mockPrismaService.location.create).toHaveBeenCalledWith({
        data: {
          name: createLocationDto.name,
          type: createLocationDto.type,
          status: createLocationDto.status,
          managerId: undefined,
        },
        include: expect.any(Object),
      });
    });
  });

  describe('findOne', () => {
    it('should return a location when found', async () => {
      const locationId = '1';
      const expectedLocation = {
        id: locationId,
        name: 'Test Warehouse',
        type: LocationType.WAREHOUSE,
        status: LocationStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        managerId: null,
        manager: null,
        assignedUsers: [],
        inventory: [],
        _count: {
          MrfsFrom: 0,
          DeliveriesTo: 0,
          DeliveriesFrom: 0,
        },
      };

      mockPrismaService.location.findFirst.mockResolvedValue(expectedLocation);

      const result = await service.findOne(locationId);

      expect(result).toEqual(expectedLocation);
      expect(mockPrismaService.location.findFirst).toHaveBeenCalledWith({
        where: {
          id: locationId,
          deletedAt: null,
        },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException when location not found', async () => {
      const locationId = '999';
      mockPrismaService.location.findFirst.mockResolvedValue(null);

      await expect(service.findOne(locationId)).rejects.toThrow(
        new NotFoundException(`Location with ID ${locationId} not found`),
      );
    });
  });

  describe('findAll', () => {
    it('should return all locations', async () => {
      const expectedLocations = [
        {
          id: '1',
          name: 'Warehouse 1',
          type: LocationType.WAREHOUSE,
          status: LocationStatus.ACTIVE,
        },
        {
          id: '2',
          name: 'Site 1',
          type: LocationType.SITE,
          status: LocationStatus.ACTIVE,
        },
      ];

      mockPrismaService.location.findMany.mockResolvedValue(expectedLocations);

      const result = await service.findAll();

      expect(result).toEqual(expectedLocations);
      expect(mockPrismaService.location.findMany).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
        },
        include: expect.any(Object),
        orderBy: {
          name: 'asc',
        },
      });
    });
  });
});
