import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';
import { Response, Request } from 'express';
import { Role, UserStatus } from '@prisma/client';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: {
    login: jest.Mock;
    logout: jest.Mock;
    refreshToken: jest.Mock;
    getUserDetailsForSession: jest.Mock;
  };
  let mockResponse: Partial<Response>;

  beforeEach(async () => {
    mockResponse = {
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis(),
    };

    mockAuthService = {
      login: jest.fn(),
      logout: jest.fn(),
      refreshToken: jest.fn(),
      getUserDetailsForSession: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should set cookies and return user data when login is successful', async () => {
      const loginDto = {
        username: 'testuser',
        password: 'password',
      };
      const dateNow = new Date();
      const serviceResponse = {
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
        user: {
          id: '1',
          username: 'testuser',
          name: 'Test User',
          email: 'test@example.com',
          role: Role.PURCHASER,
          status: UserStatus.ACTIVE,
          createdAt: dateNow,
          updatedAt: dateNow,
          locationId: null,
          deletedAt: null,
        },
      };
      const expectedControllerResponse = { user: serviceResponse.user };

      mockAuthService.login.mockResolvedValue(serviceResponse);

      const result = await controller.login(loginDto, mockResponse as Response);

      expect(result).toEqual(expectedControllerResponse);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'access_token',
        serviceResponse.access_token,
        {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          maxAge: 15 * 60 * 1000,
        },
      );
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refresh_token',
        serviceResponse.refresh_token,
        {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        },
      );
    });

    it('should throw UnauthorizedException when login fails', async () => {
      const loginDto = {
        username: 'testuser',
        password: 'wrongpassword',
      };
      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(
        controller.login(loginDto, mockResponse as Response),
      ).rejects.toThrow(UnauthorizedException);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('getSession', () => {
    it('should return user details for a valid session', async () => {
      const mockUserFromJwt = {
        id: '1',
        username: 'testuser',
        role: Role.PURCHASER,
      };
      const mockRequest = { user: mockUserFromJwt } as unknown as Request;
      const dateNow = new Date();
      const serviceResponse = {
        user: {
          id: '1',
          username: 'testuser',
          name: 'Test User',
          email: 'test@example.com',
          role: Role.PURCHASER,
          status: UserStatus.ACTIVE,
          createdAt: dateNow,
          updatedAt: dateNow,
          locationId: null,
          deletedAt: null,
        },
      };

      mockAuthService.getUserDetailsForSession.mockResolvedValue(
        serviceResponse,
      );

      const result = await controller.getSession(mockRequest);

      expect(result).toEqual(serviceResponse);
      expect(mockAuthService.getUserDetailsForSession).toHaveBeenCalledWith(
        mockUserFromJwt.id,
      );
    });

    it('should throw UnauthorizedException if user details are not on request', async () => {
      const mockRequest = {} as unknown as Request;

      await expect(controller.getSession(mockRequest)).rejects.toThrow(
        new UnauthorizedException(
          'Authentication details not found in request.',
        ),
      );
    });
  });

  describe('refreshToken', () => {
    it('should set new cookies and return success message when refresh token is valid', async () => {
      const refreshTokenDto = {
        refreshToken: 'valid-refresh-token',
      };
      const serviceResponse = {
        access_token: 'new-test-access-token',
        refresh_token: 'new-test-refresh-token',
      };
      const expectedControllerResponse = {
        message: 'Tokens refreshed successfully',
      };

      mockAuthService.refreshToken.mockResolvedValue(serviceResponse);

      const result = await controller.refreshToken(
        refreshTokenDto,
        mockResponse as Response,
      );

      expect(result).toEqual(expectedControllerResponse);
      expect(mockAuthService.refreshToken).toHaveBeenCalledWith(
        refreshTokenDto,
      );
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'access_token',
        serviceResponse.access_token,
        {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          maxAge: 15 * 60 * 1000,
        },
      );
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refresh_token',
        serviceResponse.refresh_token,
        {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        },
      );
    });

    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      const refreshTokenDto = {
        refreshToken: 'invalid-refresh-token',
      };
      mockAuthService.refreshToken.mockRejectedValue(
        new UnauthorizedException('Invalid refresh token'),
      );

      await expect(
        controller.refreshToken(refreshTokenDto, mockResponse as Response),
      ).rejects.toThrow(UnauthorizedException);
      expect(mockAuthService.refreshToken).toHaveBeenCalledWith(
        refreshTokenDto,
      );
    });
  });

  describe('logout', () => {
    it('should call authService.logout and clear cookies', () => {
      const token = 'test-token';
      const authHeader = `Bearer ${token}`;

      controller.logout(authHeader, mockResponse as Response);

      expect(mockAuthService.logout).toHaveBeenCalledWith(token);
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('access_token');
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('refresh_token');
    });

    it('should throw UnauthorizedException when no token is provided', () => {
      expect(() => controller.logout('', mockResponse as Response)).toThrow(
        UnauthorizedException,
      );
      expect(() => controller.logout('', mockResponse as Response)).toThrow(
        'No token provided',
      );
    });
  });
});
