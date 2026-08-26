import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

interface RequestWithUser extends Request {
  user: {
    id?: number;
    sub?: number;
    email: string;
    role: Role;
  };
}

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(AuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // 1. Buat Pesanan Baru
  @ApiOperation({ summary: 'Membuat pesanan baru (Checkout)' })
  @Post()
  create(
    @Request() req: RequestWithUser,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    const userId = req.user.sub ?? req.user.id;
    return this.ordersService.create(userId!, createOrderDto);
  }

  // 2. Lihat Riwayat Pesanan Pelanggan
  @ApiOperation({ summary: 'Melihat riwayat pesanan milik user yang login' })
  @Get()
  findMyOrders(@Request() req: RequestWithUser) {
    const userId = req.user.sub ?? req.user.id;
    return this.ordersService.findMyOrders(userId!);
  }

  // 3. Khusus ADMIN: Melihat seluruh pesanan semua user
  @ApiOperation({ summary: '[ADMIN] Melihat semua pesanan dari seluruh user' })
  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  findAll() {
    return this.ordersService.findAll();
  }

  // 4. Lihat Detail Single Order
  @ApiOperation({ summary: 'Melihat detail 1 pesanan berdasarkan ID' })
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: RequestWithUser,
  ) {
    const userId = req.user.sub ?? req.user.id;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return this.ordersService.findOne(id, userId!, req.user.role);
  }

  // 5. Batalkan Pesanan (Pelanggan)
  @ApiOperation({ summary: 'Membatalkan pesanan sendiri' })
  @Patch(':id/cancel')
  cancelOrder(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: RequestWithUser,
  ) {
    const userId = req.user.sub ?? req.user.id;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return this.ordersService.cancelOrder(id, userId!);
  }

  // 6. Khusus ADMIN: Update Status Pesanan (PENDING -> PAID -> SHIPPED -> COMPLETED)
  @ApiOperation({ summary: '[ADMIN] Mengubah status pesanan' })
  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return this.ordersService.updateStatus(id, updateOrderStatusDto);
  }
}
