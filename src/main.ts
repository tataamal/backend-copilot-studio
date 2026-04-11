import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Aktifkan validasi otomatis dari DTO
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // Setup Swagger untuk Copilot Studio
  const config = new DocumentBuilder()
    .setTitle('Copilot Tracking API')
    .setDescription('API Integration for Microsoft Fabric and Copilot Studio')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document); // Swagger UI

  // API akan berjalan di port 3000
  await app.listen(3000);
  console.log(`Application is running on: http://localhost:3000`);
  console.log(`Swagger UI is available at: http://localhost:3000/api-docs`);
}
bootstrap();
