import { Role } from '@prisma/client';

export class User {
  id!: number;
  email!: string;
  name!: string;
  password?: string; // Dibuat optional karena biasanya password tidak dikembalikan ke client
  role!: Role;
  createdAt!: Date;
  updatedAt!: Date;
}
