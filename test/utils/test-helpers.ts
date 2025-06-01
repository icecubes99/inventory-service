import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../../src/prisma/prisma.service';
import { Role, LocationType, LocationStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export interface TestUser {
  id: string;
  username: string;
  name: string;
  email: string;
  role: Role;
  token?: string;
}

export interface TestLocation {
  id: string;
  name: string;
  type: LocationType;
  status: LocationStatus;
  managerId?: string;
}

export class TestDataHelper {
  constructor(
    private readonly app: INestApplication,
    private readonly prisma: PrismaService,
  ) {}

  async createTestUser(
    userData: Partial<{
      username: string;
      name: string;
      email: string;
      role: Role;
      password: string;
    }>,
  ): Promise<TestUser> {
    const defaultPassword = 'testpassword123';
    const hashedPassword = await bcrypt.hash(
      userData.password || defaultPassword,
      10,
    );

    const user = await this.prisma.user.create({
      data: {
        username: userData.username || `user_${Date.now()}`,
        passwordHash: hashedPassword,
        name: userData.name || 'Test User',
        email: userData.email || `test${Date.now()}@example.com`,
        role: userData.role || Role.FOREMAN,
      },
    });

    return {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  async createTestLocation(
    locationData: Partial<{
      name: string;
      type: LocationType;
      status: LocationStatus;
      managerId: string;
    }>,
  ): Promise<TestLocation> {
    const location = await this.prisma.location.create({
      data: {
        name: locationData.name || `Test Location ${Date.now()}`,
        type: locationData.type || LocationType.WAREHOUSE,
        status: locationData.status || LocationStatus.ACTIVE,
        managerId: locationData.managerId || null,
      },
    });

    return {
      id: location.id,
      name: location.name,
      type: location.type,
      status: location.status,
      managerId: location.managerId || undefined,
    };
  }

  async loginUser(
    username: string,
    password: string = 'testpassword123',
  ): Promise<{ token: string; user: any }> {
    const response = await request(this.app.getHttpServer())
      .post('/api/auth/login')
      .send({ username, password })
      .expect(200);

    // Extract token from cookie
    const cookies = response.headers['set-cookie'] as unknown as string[];
    const accessTokenCookie = cookies?.find((cookie: string) =>
      cookie.startsWith('access_token='),
    );
    const token = accessTokenCookie?.split('=')[1]?.split(';')[0];

    if (!token) {
      throw new Error('No access token found in response cookies');
    }

    return { token, user: response.body.user };
  }

  makeAuthenticatedRequest(
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
    path: string,
    token: string,
    body?: any,
  ) {
    const req = request(this.app.getHttpServer())
      [method.toLowerCase()](path)
      .set('Cookie', `access_token=${token}`);

    if (body) {
      req.send(body);
    }

    return req;
  }

  async cleanupTestData(): Promise<void> {
    // Clean up in reverse order of dependencies
    await this.prisma.location.deleteMany({});
    await this.prisma.user.deleteMany({});
  }

  // Helper method to create a full test environment
  async createTestEnvironment(): Promise<{
    admin: TestUser & { token: string };
    warehouseManager: TestUser & { token: string };
    siteManager: TestUser & { token: string };
    regularUser: TestUser & { token: string };
    warehouse: TestLocation;
    site: TestLocation;
  }> {
    // Create users
    const admin = await this.createTestUser({
      username: 'admin_test',
      name: 'Admin Test User',
      email: 'admin@test.com',
      role: Role.ADMIN,
    });

    const warehouseManager = await this.createTestUser({
      username: 'warehouse_manager_test',
      name: 'Warehouse Manager Test',
      email: 'warehouse@test.com',
      role: Role.WAREHOUSE_MANAGER,
    });

    const siteManager = await this.createTestUser({
      username: 'site_manager_test',
      name: 'Site Manager Test',
      email: 'sitemanager@test.com',
      role: Role.SITE_MANAGER,
    });

    const regularUser = await this.createTestUser({
      username: 'regular_test',
      name: 'Regular Test User',
      email: 'regular@test.com',
      role: Role.FOREMAN,
    });

    // Login users to get tokens
    const adminLogin = await this.loginUser(admin.username);
    const warehouseManagerLogin = await this.loginUser(
      warehouseManager.username,
    );
    const siteManagerLogin = await this.loginUser(siteManager.username);
    const regularUserLogin = await this.loginUser(regularUser.username);

    // Create locations
    const warehouse = await this.createTestLocation({
      name: 'Test Central Warehouse',
      type: LocationType.WAREHOUSE,
      status: LocationStatus.ACTIVE,
      managerId: warehouseManager.id,
    });

    const site = await this.createTestLocation({
      name: 'Test Construction Site',
      type: LocationType.SITE,
      status: LocationStatus.ACTIVE,
      managerId: siteManager.id,
    });

    return {
      admin: { ...admin, token: adminLogin.token },
      warehouseManager: {
        ...warehouseManager,
        token: warehouseManagerLogin.token,
      },
      siteManager: { ...siteManager, token: siteManagerLogin.token },
      regularUser: { ...regularUser, token: regularUserLogin.token },
      warehouse,
      site,
    };
  }
}

// Common test expectations
export const expectValidationError = (response: any, field: string) => {
  expect(response.status).toBe(400);
  expect(response.body.message).toContain(field);
};

export const expectUnauthorized = (response: any) => {
  expect(response.status).toBe(401);
};

export const expectForbidden = (response: any) => {
  expect(response.status).toBe(403);
};

export const expectNotFound = (response: any) => {
  expect(response.status).toBe(404);
  expect(response.body.message).toContain('not found');
};

// Common test data generators
export const generateItemData = (overrides?: any) => ({
  code: `ITEM_${Date.now()}`,
  description: 'Test Item Description',
  unitOfMeasurement: 'PCS',
  category: 'Test Category',
  minStockLevel: 10,
  maxStockLevel: 100,
  ...overrides,
});

export const generateInventoryData = (
  itemId: string,
  locationId: string,
  overrides?: any,
) => ({
  itemId,
  locationId,
  quantity: 50,
  reservedQuantity: 0,
  ...overrides,
});

export const generateMrfData = (
  fromLocationId: string,
  toLocationId: string,
  overrides?: any,
) => ({
  mrfNumber: `MRF_${Date.now()}`,
  fromLocationId,
  toLocationId,
  description: 'Test Material Request',
  requestedBy: 'Test User',
  ...overrides,
});
