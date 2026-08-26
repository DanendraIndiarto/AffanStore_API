import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Hanya ekspor UsersService agar bisa dipakai di AuthModule/OrdersModule
})
export class UsersModule {}
