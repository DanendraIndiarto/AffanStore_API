import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService], // PrismaService dihapus dari sini karena sudah Global
})
export class OrdersModule {}
