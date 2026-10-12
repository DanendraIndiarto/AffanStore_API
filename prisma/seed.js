const { PrismaClient, Role } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@affanstore.com';
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // 1. Pastikan Super Admin selalu siap dengan role ADMIN
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

  // 2. Tambahkan produk awal jika belum ada
  const productCount = await prisma.product.count();
  if (productCount === 0) {
    await prisma.product.createMany({
      data: [
        {
          name: 'Sepatu Running Nike Air Zoom',
          description: 'Sepatu running ringan dan nyaman untuk olahraga harian.',
          price: 750000,
          category: 'Sepatu',
          stock: 15,
          imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
        },
        {
          name: 'Jaket Hoodie Streetwear Hitam',
          description: 'Jaket hoodie fleece tebal premium nyaman dipakai santai.',
          price: 250000,
          category: 'Pakaian',
          stock: 20,
          imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80',
        },
        {
          name: 'Smartwatch Fitness Tracker Pro',
          description: 'Jam tangan pintar dengan sensor detak jantung, SpO2, dan baterai awet.',
          price: 499000,
          category: 'Elektronik',
          stock: 8,
          imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
        },
        {
          name: 'Kaos Polos Cotton Combed 30s',
          description: 'Kaos katun lembut adem menyerap keringat standar distro.',
          price: 85000,
          category: 'Pakaian',
          stock: 35,
          imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
        },
      ],
    });
    console.log('✅ Produk awal berhasil ditambahkan!');
  }
}

main()
  .catch((e) => {
    console.error('❌ Error saat seeding:', e);
    // non-fatal
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
