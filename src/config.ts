import { plainToInstance } from 'class-transformer';
import { IsNumber, Max, Min, IsString, validateSync } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

class Config {
  @IsNumber()
  @Min(0)
  @Max(65535)
  PORT: number;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  JWT_SECRET: string;
}

export function validate(maybeConfig: Record<string, unknown>): Config {
  const config = plainToInstance(Config, maybeConfig, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(config, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return config;
}

@Injectable()
export class ConfigService {
  constructor(private configService: NestConfigService) {}

  get PORT() {
    const v = this.configService.get<string>('PORT');
    if (!v) {
      throw new Error('no PORT in config');
    }
    return v;
  }

  get DATABASE_URL() {
    const v = this.configService.get<string>('DATABASE_URL');
    if (!v) {
      throw new Error('no DATABASE_URL in config');
    }
    return v;
  }

  get JWT_SECRET() {
    const v = this.configService.get<string>('JWT_SECRET');
    if (!v) {
      throw new Error('no JWT_SECRET in config');
    }

    return v;
  }
}
