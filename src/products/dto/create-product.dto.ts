import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Sepatu Running Adidas' })
  @IsString()
  @IsNotEmpty({ message: 'Nama produk tidak boleh kosong' })
  name!: string;

  @ApiPropertyOptional({ example: 'Sepatu lari berbahan nyaman dan ringan' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 500000 })
  @Type(() => Number)
  @IsInt({ message: 'Harga harus berupa angka bulat' })
  @Min(0, { message: 'Harga tidak boleh kurang dari 0' })
  price!: number;

  @ApiProperty({ example: 'Sepatu' })
  @IsString()
  @IsNotEmpty({ message: 'Kategori wajib diisi' })
  category!: string;

  @ApiProperty({ example: 10 })
  @Type(() => Number)
  @IsInt({ message: 'Stok harus berupa angka bulat' })
  @Min(0, { message: 'Stok tidak boleh kurang dari 0' })
  stock!: number;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'File gambar produk',
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;
}
