import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@affanstore.com';
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Gunakan upsert agar jika sudah ada, role langsung diubah menjadi ADMIN
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: Role.ADMIN,
      password: hashedPassword,
    },
    create: {
      name: 'Super Admin',
      email: adminEmail,
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  console.log('✅ Akun Admin Siap:', admin.email, 'Role:', admin.role);
}

main()
  .catch((e: unknown) => {
    console.error('Error saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

