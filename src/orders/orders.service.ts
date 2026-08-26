import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { PaymentMethod, ShippingType, OrderStatus, Role } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  // 1. Buat Pesanan Baru
  async create(userId: number, dto: CreateOrderDto) {
    // Validasi Aturan CASH wajib COD
    if (
      dto.paymentMethod === PaymentMethod.CASH &&
      dto.shippingType !== ShippingType.COD
    ) {
      throw new BadRequestException(
        'Pembayaran CASH wajib menggunakan metode pengiriman COD!',
      );
    }

    // Validasi Aturan QRIS wajib NON_COD
    if (
      dto.paymentMethod === PaymentMethod.QRIS &&
      dto.shippingType !== ShippingType.NON_COD
    ) {
      throw new BadRequestException(
        'Pembayaran QRIS wajib menggunakan metode pengiriman NON_COD!',
      );
    }

    // Jalankan Transaksi Database secara Atomic
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: dto.productId },
      });

      if (!product) {
        throw new NotFoundException('Produk tidak ditemukan');
      }

      if (product.stock < dto.quantity) {
        throw new BadRequestException(
          `Stok produk tidak mencukupi (Sisa stok: ${product.stock})`,
        );
      }

      const totalAmount = product.price * dto.quantity;

      // Simpan Order & OrderItem
      const order = await tx.order.create({
        data: {
          userId,
          totalAmount,
          paymentMethod: dto.paymentMethod,
          shippingType: dto.shippingType,
          status: OrderStatus.PENDING,
          orderItems: {
            create: {
              productId: product.id,
              quantity: dto.quantity,
              price: product.price,
            },
          },
        },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      });

      // Kurangi Stok Produk
      await tx.product.update({
        where: { id: product.id },
        data: { stock: product.stock - dto.quantity },
      });

      return order;
    });
  }

  // 2. Menampilkan seluruh order (Khusus Admin)
  async findAll() {
    return this.prisma.order.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        orderItems: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 3. Menampilkan riwayat order milik user yang sedang login
  async findMyOrders(userId: number) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 4. Menampilkan detail 1 pesanan berdasarkan ID
  async findOne(id: number, userId: number, role: Role) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        orderItems: { include: { product: true } },
      },
    });

    if (!order) {
      throw new NotFoundException('Pesanan tidak ditemukan');
    }

    // Hanya Admin atau Pemilik Pesanan yang boleh melihat detailnya
    if (role !== Role.ADMIN && order.userId !== userId) {
      throw new ForbiddenException(
        'Anda tidak memiliki akses untuk melihat pesanan ini',
      );
    }

    return order;
  }

  // 5. Membatalkan pesanan (User) & Pengembalian Stok
  async cancelOrder(id: number, userId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { orderItems: true },
    });

    if (!order) {
      throw new NotFoundException('Pesanan tidak ditemukan');
    }

    if (order.userId !== userId) {
      throw new ForbiddenException(
        'Anda hanya bisa membatalkan pesanan sendiri',
      );
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(
        'Hanya pesanan berstatus PENDING yang dapat dibatalkan',
      );
    }

    // Kembalikan stok produk & ubah status pesanan menjadi CANCELLED
    return this.prisma.$transaction(async (tx) => {
      for (const item of order.orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      return tx.order.update({
        where: { id },
        data: { status: OrderStatus.CANCELLED },
      });
    });
  }

  // 6. Update Status Pesanan (Khusus Admin)
  async updateStatus(id: number, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { orderItems: true },
    });

    if (!order) {
      throw new NotFoundException('Pesanan tidak ditemukan');
    }

    // Jika Admin mengubah status dari PENDING/PAID ke CANCELLED, kembalikan stok
    if (
      dto.status === OrderStatus.CANCELLED &&
      order.status !== OrderStatus.CANCELLED
    ) {
      return this.prisma.$transaction(async (tx) => {
        for (const item of order.orderItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }

        return tx.order.update({
          where: { id },
          data: { status: dto.status },
        });
      });
    }

    return this.prisma.order.update({
      where: { id },
      data: { status: dto.status },
    });
  }

  // 7. Konfirmasi pembayaran QRIS menjadi PAID
  async markAsPaid(orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Pesanan tidak ditemukan');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.PAID },
    });
  }
}
