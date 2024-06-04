import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards';
import { APP_GUARD } from '@nestjs/core';
import {
  ConfigModule,
  ConfigService as NestConfigService,
} from '@nestjs/config';
import { ConfigService } from '../config';

@Module({
  imports: [
    PassportModule,
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [NestConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          secret: configService.JWT_SECRET,
          signOptions: { expiresIn: '3h' },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    ConfigService,
    AuthService,
    LocalStrategy,
    JwtStrategy,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AuthModule {}
