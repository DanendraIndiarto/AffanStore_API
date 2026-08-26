import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { PrismaService } from '../prisma/prisma.service'; // 1. Import PrismaService

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, PrismaService], // 2. Tambahkan PrismaService di sini
})
export class ProductsModule {}
