import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';

export class UpdateOrderStatusDto {
  @ApiProperty({
    description: 'Status baru untuk pesanan',
    enum: OrderStatus,
    example: OrderStatus.PAID,
  })
  @IsNotEmpty({ message: 'Status pesanan tidak boleh kosong' })
  @IsEnum(OrderStatus, { message: 'Status pesanan tidak valid' })
  status!: OrderStatus;
}
