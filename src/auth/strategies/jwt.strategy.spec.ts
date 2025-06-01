import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let mockConfigService: {
    get: jest.Mock;
  };
  let mockAuthService: {
    isTokenBlacklisted: jest.Mock;
  };

  beforeEach(async () => {
    mockConfigService = {
      get: jest.fn().mockReturnValue('dummy-secret-key'),
    };
    mockAuthService = {
      isTokenBlacklisted: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    const payload = {
      sub: '1',
      username: 'testuser',
      role: 'PURCHASER',
    };

    it('should return user object from payload when token is in Authorization header and valid', () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer valid-token-header',
        },
        cookies: {},
      } as unknown as Request;

      mockAuthService.isTokenBlacklisted.mockReturnValue(false);
      const result = strategy.validate(mockRequest, payload);
      expect(result).toEqual({
        id: payload.sub,
        username: payload.username,
        role: payload.role,
      });
      expect(mockAuthService.isTokenBlacklisted).toHaveBeenCalledWith(
        'valid-token-header',
      );
    });

    it('should return user object from payload when token is in cookie and valid', () => {
      const mockRequest = {
        headers: {},
        cookies: {
          access_token: 'valid-token-cookie',
        },
      } as unknown as Request;

      mockAuthService.isTokenBlacklisted.mockReturnValue(false);
      const result = strategy.validate(mockRequest, payload);
      expect(result).toEqual({
        id: payload.sub,
        username: payload.username,
        role: payload.role,
      });
      expect(mockAuthService.isTokenBlacklisted).toHaveBeenCalledWith(
        'valid-token-cookie',
      );
    });

    it('should prioritize Authorization header token if both header and cookie token exist', () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer header-token-priority',
        },
        cookies: {
          access_token: 'cookie-token-ignored',
        },
      } as unknown as Request;

      mockAuthService.isTokenBlacklisted.mockReturnValue(false);
      strategy.validate(mockRequest, payload);
      expect(mockAuthService.isTokenBlacklisted).toHaveBeenCalledWith(
        'header-token-priority',
      );
    });

    it('should throw UnauthorizedException when token is blacklisted (from header)', () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer blacklisted-header-token',
        },
        cookies: {},
      } as unknown as Request;
      mockAuthService.isTokenBlacklisted.mockReturnValue(true);

      expect(() => strategy.validate(mockRequest, payload)).toThrow(
        UnauthorizedException,
      );
      expect(() => strategy.validate(mockRequest, payload)).toThrow(
        'Token has been invalidated',
      );
      expect(mockAuthService.isTokenBlacklisted).toHaveBeenCalledWith(
        'blacklisted-header-token',
      );
    });

    it('should throw UnauthorizedException when token is blacklisted (from cookie)', () => {
      const mockRequest = {
        headers: {},
        cookies: {
          access_token: 'blacklisted-cookie-token',
        },
      } as unknown as Request;
      mockAuthService.isTokenBlacklisted.mockReturnValue(true);

      expect(() => strategy.validate(mockRequest, payload)).toThrow(
        UnauthorizedException,
      );
      expect(() => strategy.validate(mockRequest, payload)).toThrow(
        'Token has been invalidated',
      );
      expect(mockAuthService.isTokenBlacklisted).toHaveBeenCalledWith(
        'blacklisted-cookie-token',
      );
    });

    it('should throw UnauthorizedException when no token is provided in header or cookie', () => {
      const mockRequest = {
        headers: {},
        cookies: {},
      } as unknown as Request;

      expect(() => strategy.validate(mockRequest, payload)).toThrow(
        UnauthorizedException,
      );
      expect(() => strategy.validate(mockRequest, payload)).toThrow(
        'No token provided',
      );
    });
  });
});
