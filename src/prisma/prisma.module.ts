import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Membuat PrismaService bisa dipakai di modul manapun tanpa import ulang!
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
