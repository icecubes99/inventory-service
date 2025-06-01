import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TokenBlacklistService } from '../token-blacklist.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly tokenBlacklistService: TokenBlacklistService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    let token = this.extractTokenFromHeader(request);
    if (!token) {
      token = this.extractTokenFromCookie(request);
    }

    if (token && this.tokenBlacklistService.isBlacklisted(token)) {
      throw new UnauthorizedException('Token has been invalidated');
    }

    return super.canActivate(context) as Promise<boolean>;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, tokenValue] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? tokenValue : undefined;
  }

  private extractTokenFromCookie(request: any): string | undefined {
    return request.cookies?.access_token;
  }
}
