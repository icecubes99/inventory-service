/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { UnauthorizedException } from '@nestjs/common';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let configService: ConfigService;
  let authService: AuthService;

  const mockConfigService = {
    get: jest.fn().mockReturnValue('dummy-secret-key'),
  };

  const mockAuthService = {
    isTokenBlacklisted: jest.fn(),
  };

  beforeEach(async () => {
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
    configService = module.get<ConfigService>(ConfigService);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return user object from payload when token is valid', () => {
      const request = {
        headers: {
          authorization: 'Bearer valid-token',
        },
      };
      const payload = {
        sub: '1',
        username: 'testuser',
        role: 'PURCHASER',
      };

      mockAuthService.isTokenBlacklisted.mockReturnValue(false);

      const result = strategy.validate(request, payload);

      expect(result).toEqual({
        id: payload.sub,
        username: payload.username,
        role: payload.role,
      });
    });

    it('should throw UnauthorizedException when token is blacklisted', () => {
      const request = {
        headers: {
          authorization: 'Bearer blacklisted-token',
        },
      };
      const payload = {
        sub: '1',
        username: 'testuser',
        role: 'PURCHASER',
      };

      mockAuthService.isTokenBlacklisted.mockReturnValue(true);

      expect(() => strategy.validate(request, payload)).toThrow(
        UnauthorizedException,
      );
      expect(() => strategy.validate(request, payload)).toThrow(
        'Token has been invalidated',
      );
    });

    it('should throw UnauthorizedException when no token is provided', () => {
      const request = {
        headers: {},
      };
      const payload = {
        sub: '1',
        username: 'testuser',
        role: 'PURCHASER',
      };

      expect(() => strategy.validate(request, payload)).toThrow(
        UnauthorizedException,
      );
      expect(() => strategy.validate(request, payload)).toThrow(
        'No token provided',
      );
    });
  });
});
