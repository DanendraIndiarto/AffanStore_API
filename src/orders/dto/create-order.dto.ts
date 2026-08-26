import { IsEnum, IsInt, IsNotEmpty, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod, ShippingType } from '@prisma/client';

export class CreateOrderDto {
  @ApiProperty({ example: 1, description: 'ID Produk yang dibeli' })
  @Type(() => Number)
  @IsInt({ message: 'Product ID harus berupa angka' })
  @IsNotEmpty({ message: 'Product ID tidak boleh kosong' })
  productId!: number;

  @ApiProperty({ example: 2, description: 'Jumlah barang yang dipesan' })
  @Type(() => Number)
  @IsInt({ message: 'Quantity harus berupa angka' })
  @Min(1, { message: 'Minimal pembelian adalah 1' })
  quantity!: number;

  @ApiProperty({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    enum: PaymentMethod,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    example: PaymentMethod.QRIS,
    description: 'Metode Pembayaran (CASH / QRIS)',
  })
  @IsEnum(PaymentMethod, { message: 'Payment method harus CASH atau QRIS' })
  paymentMethod!: PaymentMethod;

  @ApiProperty({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    enum: ShippingType,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    example: ShippingType.NON_COD,
    description: 'Tipe Pengiriman (COD / NON_COD)',
  })
  @IsEnum(ShippingType, { message: 'Shipping type harus COD atau NON_COD' })
  shippingType!: ShippingType;
}
