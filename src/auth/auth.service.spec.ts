import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let userService: UserService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let jwtService: JwtService;

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
  };

  const mockJwtService = {
    sign: jest.fn(),
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
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
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
    it('should return access token and user data when login is successful', async () => {
      mockUserService.findByUsername.mockResolvedValue(mockUser);
      (jest.spyOn(bcrypt, 'compare') as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('test-token');

      const result = await service.login({
        username: 'testuser',
        password: 'password',
      });

      expect(result).toEqual({
        access_token: 'test-token',
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
});
