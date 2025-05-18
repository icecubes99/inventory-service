import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    login: jest.fn(),
    logout: jest.fn(),
    refreshToken: jest.fn(),
  };

  beforeEach(async () => {
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
    it('should return access token and user data when login is successful', async () => {
      const loginDto = {
        username: 'testuser',
        password: 'password',
      };

      const expectedResponse = {
        access_token: 'test-token',
        refresh_token: 'refresh-token',
        user: {
          id: '1',
          username: 'testuser',
          name: 'Test User',
          email: 'test@example.com',
          role: 'PURCHASER',
        },
      };

      mockAuthService.login.mockResolvedValue(expectedResponse);

      const result = await controller.login(loginDto);

      expect(result).toEqual(expectedResponse);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should throw UnauthorizedException when login fails', async () => {
      const loginDto = {
        username: 'testuser',
        password: 'wrongpassword',
      };

      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('refreshToken', () => {
    it('should return new access and refresh tokens when refresh token is valid', async () => {
      const refreshTokenDto = {
        refreshToken: 'valid-refresh-token',
      };

      const expectedResponse = {
        access_token: 'new-test-token',
        refresh_token: 'new-refresh-token',
      };

      mockAuthService.refreshToken.mockResolvedValue(expectedResponse);

      const result = await controller.refreshToken(refreshTokenDto);

      expect(result).toEqual(expectedResponse);
      expect(mockAuthService.refreshToken).toHaveBeenCalledWith(
        refreshTokenDto,
      );
    });

    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      const refreshTokenDto = {
        refreshToken: 'invalid-refresh-token',
      };

      mockAuthService.refreshToken.mockRejectedValue(
        new UnauthorizedException('Invalid refresh token'),
      );

      await expect(controller.refreshToken(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockAuthService.refreshToken).toHaveBeenCalledWith(
        refreshTokenDto,
      );
    });
  });

  describe('logout', () => {
    it('should call authService.logout with the token', () => {
      const token = 'test-token';
      controller.logout(`Bearer ${token}`);
      expect(mockAuthService.logout).toHaveBeenCalledWith(token);
    });

    it('should throw UnauthorizedException when no token is provided', () => {
      expect(() => controller.logout('')).toThrow(UnauthorizedException);
      expect(() => controller.logout('')).toThrow('No token provided');
    });
  });
});
