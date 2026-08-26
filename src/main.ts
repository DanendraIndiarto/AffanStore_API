import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 1. Mengaktifkan CORS agar API bisa diakses oleh Frontend
  app.enableCors();

  // 2. Akses folder 'uploads' secara publik di URL /uploads/...
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // 3. Mengaktifkan Global Validation Pipe untuk DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Menghapus property JSON yang tidak ada di DTO
      transform: true, // Otomatis mengonversi tipe data
    }),
  );

  // 4. Konfigurasi Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Affan Store API')
    .setDescription('Dokumentasi API E-Commerce Affan Store')
    .setVersion('1.0')
    .addBearerAuth() // Mendukung pengujian token JWT di Swagger
    .build();

  // Buat dokumen Swagger terlebih dahulu
  const document = SwaggerModule.createDocument(app, config);
  // Baru setup Swagger ke path 'api'
  SwaggerModule.setup('api', app, document);

  // 5. Jalankan Server di Port 3000
  await app.listen(3000);
  console.log('🚀 Server AffanStore berjalan di: http://localhost:3000');
  console.log('📚 Dokumentasi Swagger: http://localhost:3000/api');
  console.log('📁 Folder Static Assets: http://localhost:3000/uploads/');
}

void bootstrap();
