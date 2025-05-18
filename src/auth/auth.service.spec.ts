import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { TokenBlacklistService } from './token-blacklist.service';

describe('AuthService', () => {
  let service: AuthService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let userService: UserService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let jwtService: JwtService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let tokenBlacklistService: TokenBlacklistService;

  const mockUser = {
    id: '1',
    username: 'testuser',
    passwordHash: 'hashedpassword',
    name: 'Test User',
    email: 'test@example.com',
    role: Role.PURCHASER,
  };

  const mockUserService = {
    findByUsername: jest.fn(),
    findOne: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    decode: jest.fn(),
    verify: jest.fn(),
  };

  const mockTokenBlacklistService = {
    addToBlacklist: jest.fn(),
    isBlacklisted: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: TokenBlacklistService,
          useValue: mockTokenBlacklistService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
    tokenBlacklistService = module.get<TokenBlacklistService>(
      TokenBlacklistService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user object when credentials are valid', async () => {
      mockUserService.findByUsername.mockResolvedValue(mockUser);
      (jest.spyOn(bcrypt, 'compare') as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('testuser', 'password');
      expect(result).toEqual({
        id: mockUser.id,
        username: mockUser.username,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
      });
    });

    it('should return null when credentials are invalid', async () => {
      mockUserService.findByUsername.mockResolvedValue(mockUser);
      (jest.spyOn(bcrypt, 'compare') as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('testuser', 'wrongpassword');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token, refresh token and user data when login is successful', async () => {
      mockUserService.findByUsername.mockResolvedValue(mockUser);
      (jest.spyOn(bcrypt, 'compare') as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('test-token');

      const result = await service.login({
        username: 'testuser',
        password: 'password',
      });

      expect(result).toEqual({
        access_token: 'test-token',
        refresh_token: 'test-token',
        user: {
          id: mockUser.id,
          username: mockUser.username,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role,
        },
      });
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      mockUserService.findByUsername.mockResolvedValue(mockUser);
      (jest.spyOn(bcrypt, 'compare') as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({
          username: 'testuser',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshToken', () => {
    it('should return new access and refresh tokens when refresh token is valid', async () => {
      const payload = {
        sub: mockUser.id,
        username: mockUser.username,
        role: mockUser.role,
      };

      mockJwtService.verify.mockResolvedValue(payload);
      mockUserService.findOne.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('new-test-token');

      const result = await service.refreshToken({
        refreshToken: 'valid-refresh-token',
      });

      expect(result).toEqual({
        access_token: 'new-test-token',
        refresh_token: 'new-test-token',
      });
    });

    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      mockJwtService.verify.mockRejectedValue(new Error('Invalid token'));

      await expect(
        service.refreshToken({ refreshToken: 'invalid-refresh-token' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      const payload = {
        sub: 'non-existent-id',
        username: 'testuser',
        role: 'PURCHASER',
      };

      mockJwtService.verify.mockResolvedValue(payload);
      mockUserService.findOne.mockResolvedValue(null);

      await expect(
        service.refreshToken({ refreshToken: 'valid-refresh-token' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should add token to blacklist', () => {
      const token = 'valid-token';
      service.logout(token);
      expect(mockTokenBlacklistService.addToBlacklist).toHaveBeenCalledWith(
        token,
      );
    });
  });

  describe('isTokenBlacklisted', () => {
    it('should return true for blacklisted token', () => {
      const token = 'blacklisted-token';
      mockTokenBlacklistService.isBlacklisted.mockReturnValue(true);
      expect(service.isTokenBlacklisted(token)).toBe(true);
    });

    it('should return false for non-blacklisted token', () => {
      const token = 'valid-token';
      mockTokenBlacklistService.isBlacklisted.mockReturnValue(false);
      expect(service.isTokenBlacklisted(token)).toBe(false);
    });
  });
});
