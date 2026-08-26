import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@affanstore.com';

  // 1. Cek apakah admin sudah ada di database
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    // 2. Hash password default admin
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // 3. Buat akun Super Admin baru
    const admin = await prisma.user.create({
      data: {
        name: 'Super Admin',
        email: adminEmail,
        password: hashedPassword,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        role: Role.ADMIN,
      },
    });

    console.log('✅ Admin berhasil dibuat:', admin.email);
  } else {
    console.log('ℹ️ Admin sudah ada di database.');
  }
}

main()
  .catch((e: unknown) => {
    console.error('❌ Terjadi kesalahan saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
