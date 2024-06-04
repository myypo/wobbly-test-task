import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { ConfigService, validate } from './config';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate,
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    ProductsModule,
    AuthModule,
    UsersModule,
  ],
  providers: [ConfigService, PrismaService],
})
export class AppModule {}
