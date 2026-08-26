import { PaymentMethod, ShippingType, OrderStatus } from '@prisma/client';

export class Order {
  id!: number;
  userId!: number;
  totalAmount!: number;
  paymentMethod!: PaymentMethod;
  shippingType!: ShippingType;
  status!: OrderStatus;
  createdAt!: Date;
  updatedAt!: Date;
}
