import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { PrismaService } from './prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

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

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // 5. Inisialisasi Akun Super Admin Otomatis saat Startup
  try {
    const prisma = app.get(PrismaService);
    const adminEmail = 'admin@affanstore.com';
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        role: Role.ADMIN,
      },
      create: {
        name: 'Admin Affan',
        email: adminEmail,
        password: hashedPassword,
        role: Role.ADMIN,
      },
    });
    console.log('✅ Akun Admin Siap di Database:', adminEmail);
  } catch (err) {
    console.warn('⚠️ Seeding admin di bootstrap dilewati:', err);
  }

  // 6. Gunakan PORT dinamis dari Railway (Fallback ke 3000 jika dijalankan lokal)
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Server AffanStore berjalan di port: ${port}`);
  console.log(`📚 Dokumentasi Swagger dapat diakses di path /api`);
}

void bootstrap();
