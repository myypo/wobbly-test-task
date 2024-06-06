import { NestFactory, Reflector } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from './config';
import { ResponseInterceptor } from './response/response.interceptor';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  swaggerSetup(app);
  globalsSetup(app);

  const config = app.get(ConfigService);

  app.use(helmet());
  await app.listen(config.PORT);
}

async function globalsSetup(app: INestApplication) {
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
    new ResponseInterceptor(),
  );
}

async function swaggerSetup(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('The test task REST API for wobbly')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
}

bootstrap();
