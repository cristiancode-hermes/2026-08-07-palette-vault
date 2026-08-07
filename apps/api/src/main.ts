import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { SeedService } from './seed/seed.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('PaletteVault API')
    .setDescription('Color palette manager API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Seed database on startup
  const seedService = app.get(SeedService);
  await seedService.seed();

  await app.listen(3042);
  console.log('PaletteVault API running on http://localhost:3042/api');
  console.log('Swagger docs at http://localhost:3042/api/docs');
}
bootstrap();
