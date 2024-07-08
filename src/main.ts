import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('ejs');

  app.use(cookieParser());

  // so browsers can use api
  app.enableCors({
    origin: '*',
  });

  // Create a Swagger document builder
  const options = new DocumentBuilder()
    .setTitle(`FleetVRP - Route Optimization Software`)
    .setDescription(`
      - NestJS backend with EJS templates
      - HTMX frontent with materializecss theme
      - TypeORM with SQLite database
    `)
    .setVersion('1.0')
    .build();

  // Create a Swagger document and configure the UI
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(3000);
  console.log('Application is running on: http://localhost:3000');
}
bootstrap();