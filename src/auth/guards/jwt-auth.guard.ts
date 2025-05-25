import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    let token = this.extractTokenFromHeader(request);
    if (!token) {
      token = this.extractTokenFromCookie(request);
    }

    if (token && this.authService.isTokenBlacklisted(token)) {
      return false;
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
