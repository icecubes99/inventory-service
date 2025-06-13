import {
  Controller,
  Post,
  Body,
  Headers,
  UnauthorizedException,
  UseGuards,
  Get,
  Res,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Response, Request } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            username: { type: 'string', example: 'john_doe' },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: 'john@example.com' },
            role: { type: 'string', example: 'PURCHASER' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, refresh_token, user } =
      await this.authService.login(loginDto);

    // Set access token cookie
    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    // Set refresh token cookie
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return { user };
  }

  @Get('session')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current session user' })
  @ApiResponse({
    status: 200,
    description: 'Returns current authenticated user data',
    // Schema would match the user object structure returned by authService.getUserDetailsForSession
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getSession(@Req() request: Request) {
    const userFromJwt = request.user as {
      id: string;
      username: string;
      role: string;
    };
    if (!userFromJwt || !userFromJwt.id) {
      // This should ideally be caught by JwtAuthGuard if no valid user context is established
      throw new UnauthorizedException(
        'Authentication details not found in request.',
      );
    }
    return await this.authService.getUserDetailsForSession(userFromJwt.id);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'Token successfully refreshed',
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, refresh_token } =
      await this.authService.refreshToken(refreshTokenDto);

    // Set new access token cookie
    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    // Set new refresh token cookie
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return { message: 'Tokens refreshed successfully' };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 200, description: 'User successfully logged out' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  logout(
    // Consider making it async if authService.logout could be
    @Req() request: Request, // <<<< INJECT the Request object
    @Res({ passthrough: true }) res: Response,
  ) {
    // The JwtAuthGuard has already validated the access_token cookie.
    // We can retrieve it from the request cookies to pass to the blacklist service.
    const accessToken = request.cookies['access_token'];

    if (accessToken) {
      this.authService.logout(accessToken); // Call blacklist service
    } else {
      // This case should ideally not be reached if JwtAuthGuard is effective
      // and requires an access token. However, as a fallback or if the guard
      // configuration changes, you might log a warning.
      console.warn(
        'Logout called but access_token cookie was missing after JwtAuthGuard.',
      );
      // Depending on strictness, you could choose to throw UnauthorizedException here too,
      // but if the primary goal is cookie clearing, that will still proceed.
    }

    // Clear cookies
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    return { message: 'Successfully logged out' };
  }
}
