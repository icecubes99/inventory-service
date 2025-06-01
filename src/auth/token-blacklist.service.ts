import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

interface BlacklistedToken {
  token: string;
  expiresAt: number;
}

@Injectable()
export class TokenBlacklistService implements OnModuleInit {
  private readonly logger = new Logger(TokenBlacklistService.name);
  private blacklistedTokens: Map<string, BlacklistedToken> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor(private readonly jwtService: JwtService) {}

  onModuleInit() {
    // Clean up expired tokens every hour
    this.cleanupInterval = setInterval(
      () => this.cleanupExpiredTokens(),
      3600000,
    );
  }

  addToBlacklist(token: string): void {
    try {
      const decoded = this.jwtService.decode(token);
      if (decoded && 'exp' in decoded) {
        this.blacklistedTokens.set(token, {
          token,
          expiresAt: (decoded.exp as number) * 1000, // Convert to milliseconds
        });
      }
    } catch (error) {
      this.logger.warn(
        'Failed to decode token, using default expiration',
        error,
      );
      // If token can't be decoded, add it with a default expiration of 24 hours
      this.blacklistedTokens.set(token, {
        token,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      });
    }
  }

  isBlacklisted(token: string): boolean {
    const blacklistedToken = this.blacklistedTokens.get(token);
    if (!blacklistedToken) {
      return false;
    }

    // Check if token has expired
    if (Date.now() > blacklistedToken.expiresAt) {
      this.blacklistedTokens.delete(token);
      return false;
    }

    return true;
  }

  private cleanupExpiredTokens(): void {
    const now = Date.now();
    for (const [token, data] of this.blacklistedTokens.entries()) {
      if (now > data.expiresAt) {
        this.blacklistedTokens.delete(token);
      }
    }
  }

  onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }

  // For testing purposes only
  clearBlacklist(): void {
    this.blacklistedTokens.clear();
  }
}
