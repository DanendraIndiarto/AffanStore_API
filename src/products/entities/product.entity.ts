export class Product {
  id!: number;
  name!: string;
  description?: string | null;
  price!: number;
  category!: string;
  stock!: number;
  imageUrl?: string | null;
  createdAt!: Date;
  updatedAt!: Date;
}
