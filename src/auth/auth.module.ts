import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserModule } from '../user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TokenBlacklistService } from './token-blacklist.service';
import * as cookieParser from 'cookie-parser';
// import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from '../prisma/prisma.module';
import { PermissionsService } from './permissions.service';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
    PrismaModule,
    // TODO: Uncomment this when we have a need to throttle requests
    // ThrottlerModule.forRoot([
    //   {
    //     ttl: 60000,
    //     limit: 10,
    //   },
    // ]),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    TokenBlacklistService,
    // {
    //   provide: APP_GUARD,
    //   // useClass: ThrottlerGuard,
    // },
    PermissionsService,
  ],
  controllers: [AuthController],
  exports: [
    AuthService,
    TokenBlacklistService,
    PermissionsService,
    // ... other exports like JwtModule ...
  ],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(cookieParser()).forRoutes('*');
  }
}
