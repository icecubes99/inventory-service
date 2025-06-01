import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { Role, LocationType, LocationStatus } from '@prisma/client';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { TokenBlacklistService } from '../src/auth/token-blacklist.service';
import * as bcrypt from 'bcrypt';

describe('App Integration Tests (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let tokenBlacklistService: TokenBlacklistService;

  // Test data
  let adminUser: any;
  let warehouseManagerUser: any;
  let siteManagerUser: any;
  let regularUser: any;

  let adminToken: string;
  let warehouseManagerToken: string;
  let siteManagerToken: string;
  let regularUserToken: string;

  let centralWarehouse: any;
  let siteLocation: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    tokenBlacklistService = moduleFixture.get<TokenBlacklistService>(
      TokenBlacklistService,
    );

    // Apply the same configuration as in main.ts
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());

    await app.init();

    // Clean up database and seed test data
    await setupTestData();
  });

  afterAll(async () => {
    // Clean up test data
    await cleanupTestData();
    await app.close();
  });

  async function setupTestData() {
    // Clean existing data
    await prisma.location.deleteMany({});
    await prisma.user.deleteMany({});

    // Create test users with different roles
    const hashedPassword = await bcrypt.hash('testpassword123', 10);

    adminUser = await prisma.user.create({
      data: {
        username: 'admin_test',
        passwordHash: hashedPassword,
        name: 'Admin Test User',
        email: 'admin@test.com',
        role: Role.ADMIN,
      },
    });

    warehouseManagerUser = await prisma.user.create({
      data: {
        username: 'warehouse_manager_test',
        passwordHash: hashedPassword,
        name: 'Warehouse Manager Test',
        email: 'warehouse@test.com',
        role: Role.WAREHOUSE_MANAGER,
      },
    });

    siteManagerUser = await prisma.user.create({
      data: {
        username: 'site_manager_test',
        passwordHash: hashedPassword,
        name: 'Site Manager Test',
        email: 'sitemanager@test.com',
        role: Role.SITE_MANAGER,
      },
    });

    regularUser = await prisma.user.create({
      data: {
        username: 'regular_test',
        passwordHash: hashedPassword,
        name: 'Regular Test User',
        email: 'regular@test.com',
        role: Role.FOREMAN,
      },
    });
  }

  async function cleanupTestData() {
    await prisma.location.deleteMany({});
    await prisma.user.deleteMany({});
  }

  async function loginUser(
    username: string,
    password: string = 'testpassword123',
  ) {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ username, password })
      .expect(200);

    // Extract token from cookie - cookies is an array
    const cookies = response.headers['set-cookie'] as unknown as string[];
    const accessTokenCookie = cookies?.find((cookie: string) =>
      cookie.startsWith('access_token='),
    );
    const token = accessTokenCookie?.split('=')[1]?.split(';')[0];

    return { token, user: response.body.user };
  }

  describe('🔐 Authentication Module', () => {
    it('should allow admin user to login successfully', async () => {
      const { token, user } = await loginUser('admin_test');
      adminToken = token!;

      expect(user).toMatchObject({
        id: adminUser.id,
        username: 'admin_test',
        name: 'Admin Test User',
        email: 'admin@test.com',
        role: 'ADMIN',
      });
      expect(token).toBeDefined();
    });

    it('should allow warehouse manager to login', async () => {
      const { token } = await loginUser('warehouse_manager_test');
      warehouseManagerToken = token!;
      expect(token).toBeDefined();
    });

    it('should allow site manager to login', async () => {
      const { token } = await loginUser('site_manager_test');
      siteManagerToken = token!;
      expect(token).toBeDefined();
    });

    it('should allow regular user to login', async () => {
      const { token } = await loginUser('regular_test');
      regularUserToken = token!;
      expect(token).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ username: 'admin_test', password: 'wrongpassword' })
        .expect(401);
    });

    it('should get current session for authenticated user', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/auth/session')
        .set('Cookie', `access_token=${adminToken}`)
        .expect(200);

      expect(response.body.user).toMatchObject({
        id: adminUser.id,
        username: 'admin_test',
        role: 'ADMIN',
      });
    });

    it('should reject session request without token', async () => {
      await request(app.getHttpServer()).get('/api/auth/session').expect(401);
    });
  });

  describe('👥 User Management Module', () => {
    it('should allow admin to create new users', async () => {
      const newUser = {
        username: 'new_user_test',
        password: 'newpassword123',
        name: 'New Test User',
        email: 'newuser@test.com',
        role: 'PURCHASER',
      };

      const response = await request(app.getHttpServer())
        .post('/api/users')
        .set('Cookie', `access_token=${adminToken}`)
        .send(newUser)
        .expect(201);

      expect(response.body).toMatchObject({
        username: 'new_user_test',
        name: 'New Test User',
        email: 'newuser@test.com',
        role: 'PURCHASER',
      });
      expect(response.body.passwordHash).toBeUndefined(); // Shouldn't return password
    });

    it('should prevent non-admin from creating users', async () => {
      const newUser = {
        username: 'unauthorized_user',
        password: 'password123',
        name: 'Unauthorized User',
        email: 'unauthorized@test.com',
        role: 'PURCHASER',
      };

      await request(app.getHttpServer())
        .post('/api/users')
        .set('Cookie', `access_token=${regularUserToken}`)
        .send(newUser)
        .expect(403);
    });

    it('should allow authorized users to get all users', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users')
        .set('Cookie', `access_token=${warehouseManagerToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should allow users to get specific user by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/users/${adminUser.id}`)
        .set('Cookie', `access_token=${adminToken}`)
        .expect(200);

      expect(response.body.id).toBe(adminUser.id);
    });

    it('should allow users to update their own profile', async () => {
      const updateData = {
        name: 'Updated Regular User Name',
        email: 'updated@test.com',
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/users/${regularUser.id}`)
        .set('Cookie', `access_token=${regularUserToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe('Updated Regular User Name');
      expect(response.body.email).toBe('updated@test.com');
    });

    it('should prevent non-admin from changing user roles', async () => {
      await request(app.getHttpServer())
        .patch(`/api/users/${regularUser.id}`)
        .set('Cookie', `access_token=${regularUserToken}`)
        .send({ role: 'ADMIN' })
        .expect(403);
    });

    it('should allow admin to change user roles', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/users/${regularUser.id}`)
        .set('Cookie', `access_token=${adminToken}`)
        .send({ role: 'INVENTORY_MASTER' })
        .expect(200);

      expect(response.body.role).toBe('INVENTORY_MASTER');
    });
  });

  describe('🏢 Location Management Module', () => {
    it('should allow admin to create a central warehouse', async () => {
      const warehouseData = {
        name: 'Central Warehouse Test',
        type: LocationType.WAREHOUSE,
        status: LocationStatus.ACTIVE,
        managerId: warehouseManagerUser.id,
      };

      const response = await request(app.getHttpServer())
        .post('/api/locations')
        .set('Cookie', `access_token=${adminToken}`)
        .send(warehouseData)
        .expect(201);

      centralWarehouse = response.body;
      expect(response.body.name).toBe('Central Warehouse Test');
      expect(response.body.type).toBe('WAREHOUSE');
      expect(response.body.manager.id).toBe(warehouseManagerUser.id);
    });

    it('should allow warehouse manager to create a site', async () => {
      const siteData = {
        name: 'Test Construction Site',
        type: LocationType.SITE,
        status: LocationStatus.ACTIVE,
        managerId: siteManagerUser.id,
      };

      const response = await request(app.getHttpServer())
        .post('/api/locations')
        .set('Cookie', `access_token=${warehouseManagerToken}`)
        .send(siteData)
        .expect(201);

      siteLocation = response.body;
      expect(response.body.name).toBe('Test Construction Site');
      expect(response.body.type).toBe('SITE');
      expect(response.body.manager.id).toBe(siteManagerUser.id);
    });

    it('should prevent unauthorized users from creating locations', async () => {
      const locationData = {
        name: 'Unauthorized Location',
        type: LocationType.SITE,
        status: LocationStatus.ACTIVE,
      };

      await request(app.getHttpServer())
        .post('/api/locations')
        .set('Cookie', `access_token=${regularUserToken}`)
        .send(locationData)
        .expect(403);
    });

    it('should get all locations for authorized users', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/locations')
        .set('Cookie', `access_token=${warehouseManagerToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2); // Central warehouse + site
    });

    it('should get locations by type', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/locations/type/WAREHOUSE')
        .set('Cookie', `access_token=${warehouseManagerToken}`)
        .expect(200);

      expect(response.body.length).toBe(1);
      expect(response.body[0].type).toBe('WAREHOUSE');
    });

    it('should get specific location by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/locations/${centralWarehouse.id}`)
        .set('Cookie', `access_token=${warehouseManagerToken}`)
        .expect(200);

      expect(response.body.id).toBe(centralWarehouse.id);
      expect(response.body.name).toBe('Central Warehouse Test');
    });

    it('should allow manager to update their location', async () => {
      const updateData = {
        name: 'Updated Central Warehouse',
        status: LocationStatus.UNDER_MAINTENANCE,
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/locations/${centralWarehouse.id}`)
        .set('Cookie', `access_token=${warehouseManagerToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe('Updated Central Warehouse');
      expect(response.body.status).toBe('UNDER_MAINTENANCE');
    });

    it('should assign user to location', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/locations/${siteLocation.id}/assign-user`)
        .set('Cookie', `access_token=${adminToken}`)
        .send({ userId: regularUser.id })
        .expect(201);

      expect(response.body.assignedUsers).toContainEqual(
        expect.objectContaining({ id: regularUser.id }),
      );
    });

    it('should prevent duplicate user assignment', async () => {
      await request(app.getHttpServer())
        .post(`/api/locations/${siteLocation.id}/assign-user`)
        .set('Cookie', `access_token=${adminToken}`)
        .send({ userId: regularUser.id })
        .expect(403);
    });

    it('should unassign user from location', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/locations/${siteLocation.id}/unassign-user`)
        .set('Cookie', `access_token=${adminToken}`)
        .send({ userId: regularUser.id })
        .expect(201);

      expect(response.body.assignedUsers).not.toContainEqual(
        expect.objectContaining({ id: regularUser.id }),
      );
    });

    it('should set location manager', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/locations/${siteLocation.id}/set-manager`)
        .set('Cookie', `access_token=${adminToken}`)
        .send({ managerUserId: warehouseManagerUser.id })
        .expect(201);

      expect(response.body.manager.id).toBe(warehouseManagerUser.id);
    });

    it('should soft delete location', async () => {
      await request(app.getHttpServer())
        .delete(`/api/locations/${siteLocation.id}`)
        .set('Cookie', `access_token=${adminToken}`)
        .expect(204);

      // Verify location is soft deleted
      const response = await request(app.getHttpServer())
        .get('/api/locations')
        .set('Cookie', `access_token=${adminToken}`)
        .expect(200);

      expect(response.body.length).toBe(1); // Only central warehouse should remain
    });
  });

  describe('🔑 Permissions & Role-Based Access', () => {
    it('should enforce role-based access for location creation', async () => {
      // FOREMAN (regularUser) should not be able to create locations
      await request(app.getHttpServer())
        .post('/api/locations')
        .set('Cookie', `access_token=${regularUserToken}`)
        .send({
          name: 'Unauthorized Location',
          type: LocationType.SITE,
        })
        .expect(403);
    });

    it('should allow site manager to manage only their locations', async () => {
      // Create a location managed by siteManager
      const locationData = {
        name: 'Site Manager Location',
        type: LocationType.SITE,
        managerId: siteManagerUser.id,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/api/locations')
        .set('Cookie', `access_token=${adminToken}`)
        .send(locationData)
        .expect(201);

      const newLocation = createResponse.body;

      // Site manager should be able to update their location
      await request(app.getHttpServer())
        .patch(`/api/locations/${newLocation.id}`)
        .set('Cookie', `access_token=${siteManagerToken}`)
        .send({ name: 'Updated by Site Manager' })
        .expect(200);

      // Site manager should NOT be able to update warehouse location
      await request(app.getHttpServer())
        .patch(`/api/locations/${centralWarehouse.id}`)
        .set('Cookie', `access_token=${siteManagerToken}`)
        .send({ name: 'Unauthorized Update' })
        .expect(403);
    });

    it('should validate user existence for location assignments', async () => {
      const fakeUserId = '123e4567-e89b-12d3-a456-426614174000';

      await request(app.getHttpServer())
        .post(`/api/locations/${centralWarehouse.id}/assign-user`)
        .set('Cookie', `access_token=${adminToken}`)
        .send({ userId: fakeUserId })
        .expect(404);
    });
  });

  describe('🚪 Authentication Flow', () => {
    it('should complete full logout flow', async () => {
      // Login
      const { token } = await loginUser('admin_test');

      // Verify session works
      await request(app.getHttpServer())
        .get('/api/auth/session')
        .set('Cookie', `access_token=${token}`)
        .expect(200);

      // Logout
      await request(app.getHttpServer())
        .post('/api/auth/logout')
        .set('Cookie', `access_token=${token}`)
        .expect(200);

      // Verify session no longer works (token should be blacklisted)
      await request(app.getHttpServer())
        .get('/api/auth/session')
        .set('Cookie', `access_token=${token}`)
        .expect(401);

      // Clear the token blacklist
      tokenBlacklistService.clearBlacklist();
    });

    it('should handle token refresh', async () => {
      // Login to get refresh token
      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ username: 'admin_test', password: 'testpassword123' })
        .expect(200);

      const cookies = loginResponse.headers[
        'set-cookie'
      ] as unknown as string[];
      const refreshTokenCookie = cookies?.find((cookie: string) =>
        cookie.startsWith('refresh_token='),
      );
      const refreshToken = refreshTokenCookie?.split('=')[1]?.split(';')[0];

      // Use refresh token to get new tokens
      const refreshResponse = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(refreshResponse.body.message).toBe(
        'Tokens refreshed successfully',
      );
    });
  });

  describe('🔧 Error Handling & Validation', () => {
    it('should validate required fields in user creation', async () => {
      const invalidUser = {
        username: 'test',
        // Missing required fields
      };

      const response = await request(app.getHttpServer())
        .post('/api/users')
        .set('Cookie', `access_token=${adminToken}`)
        .send(invalidUser)
        .expect(400);

      expect(response.body.message).toContain('password should not be empty');
    });

    it('should validate email format', async () => {
      const invalidUser = {
        username: 'testuser',
        password: 'password123',
        name: 'Test User',
        email: 'invalid-email',
        role: 'PURCHASER',
      };

      const response = await request(app.getHttpServer())
        .post('/api/users')
        .set('Cookie', `access_token=${adminToken}`)
        .send(invalidUser)
        .expect(400);

      expect(response.body.message).toContain('email must be an email');
    });

    it('should handle 404 for non-existent resources', async () => {
      const fakeId = '123e4567-e89b-12d3-a456-426614174000';

      const response = await request(app.getHttpServer())
        .get(`/api/users/${fakeId}`)
        .set('Cookie', `access_token=${adminToken}`)
        .expect(404);

      expect(response.body.message).toContain('not found');
    });

    it('should strip non-whitelisted properties', async () => {
      const userWithExtraFields = {
        username: 'clean_user',
        password: 'password123',
        name: 'Clean User',
        email: 'clean@test.com',
        role: 'PURCHASER',
        maliciousField: 'should be removed',
        anotherBadField: 'also removed',
      };

      await request(app.getHttpServer())
        .post('/api/users')
        .set('Cookie', `access_token=${adminToken}`)
        .send(userWithExtraFields)
        .expect(400); // Should fail due to forbidNonWhitelisted: true
    });
  });

  describe('📊 Data Consistency', () => {
    it('should maintain referential integrity', async () => {
      // Create a user and assign them as manager
      const newUser = await prisma.user.create({
        data: {
          username: 'temp_manager',
          passwordHash: await bcrypt.hash('password', 10),
          name: 'Temp Manager',
          email: 'temp@test.com',
          role: Role.SITE_MANAGER,
        },
      });

      // Create location with this manager
      const locationResponse = await request(app.getHttpServer())
        .post('/api/locations')
        .set('Cookie', `access_token=${adminToken}`)
        .send({
          name: 'Temp Location',
          type: LocationType.SITE,
          managerId: newUser.id,
        })
        .expect(201);

      // Try to delete the manager - should fail
      await request(app.getHttpServer())
        .delete(`/api/users/${newUser.id}`)
        .set('Cookie', `access_token=${adminToken}`)
        .expect(403);

      // Remove manager from location first
      await request(app.getHttpServer())
        .post(`/api/locations/${locationResponse.body.id}/remove-manager`)
        .set('Cookie', `access_token=${adminToken}`)
        .expect(200);

      // Now deletion should work
      await request(app.getHttpServer())
        .delete(`/api/users/${newUser.id}`)
        .set('Cookie', `access_token=${adminToken}`)
        .expect(204);
    });

    it('should properly handle soft deletes', async () => {
      // Create and then soft delete a user
      const userToDelete = await prisma.user.create({
        data: {
          username: 'to_delete',
          passwordHash: await bcrypt.hash('password', 10),
          name: 'To Delete',
          email: 'delete@test.com',
          role: Role.FOREMAN,
        },
      });

      // Delete the user
      await request(app.getHttpServer())
        .delete(`/api/users/${userToDelete.id}`)
        .set('Cookie', `access_token=${adminToken}`)
        .expect(204);

      // User should not appear in listings
      const usersResponse = await request(app.getHttpServer())
        .get('/api/users')
        .set('Cookie', `access_token=${adminToken}`)
        .expect(200);

      expect(
        usersResponse.body.find((u: any) => u.id === userToDelete.id),
      ).toBeUndefined();

      // But should still exist in database with deletedAt
      const deletedUser = await prisma.user.findUnique({
        where: { id: userToDelete.id },
      });
      expect(deletedUser).toBeTruthy();
      expect(deletedUser!.deletedAt).toBeTruthy();
    });
  });
});
