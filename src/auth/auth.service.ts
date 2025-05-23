import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { TokenBlacklistService } from './token-blacklist.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly tokenBlacklistService: TokenBlacklistService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userService.findByUsername(username);
    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.username, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      username: user.username,
      sub: user.id,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.sign(payload, { expiresIn: '15m' }),
      this.jwtService.sign(payload, { expiresIn: '7d' }),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      const payload = await this.jwtService.verify(
        refreshTokenDto.refreshToken,
      );
      const user = await this.userService.findOne(payload.sub);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const newPayload = {
        username: user.username,
        sub: user.id,
        role: user.role,
      };

      const [newAccessToken, newRefreshToken] = await Promise.all([
        this.jwtService.sign(newPayload, { expiresIn: '15m' }),
        this.jwtService.sign(newPayload, { expiresIn: '7d' }),
      ]);

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getSession(token: string) {
    try {
      const payload = await this.jwtService.verify(token);
      const user = await this.userService.findOne(payload.sub);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return {
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      };
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async getUserDetailsForSession(userId: string) {
    const user = await this.userService.findOne(userId);
    if (!user) {
      // This case should be rare if JWT validation passed and sub (userId) was valid
      throw new UnauthorizedException('User not found for session.');
    }
    // Return a DTO or a cleaned-up user object, excluding sensitive info like passwordHash
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...userDetails } = user;
    return { user: userDetails };
  }

  logout(token: string): void {
    this.tokenBlacklistService.addToBlacklist(token);
  }

  isTokenBlacklisted(token: string): boolean {
    return this.tokenBlacklistService.isBlacklisted(token);
  }
}
