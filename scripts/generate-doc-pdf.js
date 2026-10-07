const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const outputPath = path.join(__dirname, '..', 'DOKUMENTASI_API_AFFANSTORE.pdf');

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 35, bottom: 40, left: 40, right: 40 },
  bufferPages: true,
});

const writeStream = fs.createWriteStream(outputPath);
doc.pipe(writeStream);

const C = {
  primary: '#0F172A',
  secondary: '#1E293B',
  accent: '#2563EB',
  text: '#334155',
  muted: '#64748B',
  border: '#CBD5E1',
  cardBg: '#F8FAFC',
  codeBg: '#0F172A',
  codeText: '#38BDF8',
  get: '#16A34A',
  post: '#2563EB',
  patch: '#D97706',
  del: '#DC2626',
  warningBg: '#FEF3C7',
  warningText: '#92400E',
};

const MAX_Y = 760;

function ensureSpace(height) {
  if (doc.y + height > MAX_Y) {
    doc.addPage();
  }
}

function renderHeader(title, subtitle) {
  doc.roundedRect(40, doc.y, 515, 60, 4).fill(C.primary);
  doc.fontSize(17).font('Helvetica-Bold').fillColor('#FFFFFF').text(title, 55, doc.y + 13);
  doc.fontSize(9).font('Helvetica').fillColor('#94A3B8').text(subtitle, 55, doc.y + 34);
  doc.y += 46;
}

function renderSectionTitle(title) {
  ensureSpace(40);
  doc.moveDown(0.4);
  const y = doc.y;
  doc.rect(40, y, 4, 15).fill(C.accent);
  doc.fontSize(11).font('Helvetica-Bold').fillColor(C.primary).text(title, 50, y + 1.5);
  doc.y = y + 20;
}

function renderEndpoint(method, route, access, desc, payload = null, response = null) {
  let cardHeight = 22 + 16;
  if (payload) {
    const payloadLines = payload.split('\n').length;
    cardHeight += 12 + payloadLines * 9.5 + 8;
  }
  if (response) {
    const respLines = response.split('\n').length;
    cardHeight += 12 + respLines * 9.5 + 8;
  }

  ensureSpace(cardHeight);

  const startY = doc.y;
  const methodColor = method === 'GET' ? C.get : method === 'POST' ? C.post : method === 'PATCH' ? C.patch : C.del;

  // Header Bar
  doc.roundedRect(40, startY, 515, 18, 2).fill(C.cardBg);

  // Method Badge
  doc.roundedRect(44, startY + 2.5, 42, 13, 2).fill(methodColor);
  doc.fontSize(7.5).font('Helvetica-Bold').fillColor('#FFFFFF').text(method, 44, startY + 4.5, { width: 42, align: 'center' });

  // Route Path
  doc.fontSize(8.5).font('Helvetica-Bold').fillColor(C.primary).text(route, 92, startY + 4.5);

  // Access Badge
  doc.fontSize(7.5).font('Helvetica-Bold').fillColor(access.includes('ADMIN') ? C.del : C.accent).text(access.toUpperCase(), 430, startY + 4.5, { align: 'right', width: 120 });

  doc.y = startY + 21;
  doc.fontSize(8).font('Helvetica').fillColor(C.text).text(desc, 44, doc.y, { width: 507 });
  doc.y += 2;

  if (payload) {
    doc.fontSize(7).font('Helvetica-Bold').fillColor(C.muted).text('REQUEST PAYLOAD / BODY:', 44, doc.y);
    const boxY = doc.y + 2;
    const lines = payload.split('\n');
    const height = lines.length * 9.5 + 6;
    doc.roundedRect(44, boxY, 507, height, 2).fill(C.codeBg);
    doc.fontSize(7).font('Courier').fillColor(C.codeText).text(payload, 48, boxY + 3, { width: 499, lineGap: 0.8 });
    doc.y = boxY + height + 3;
  }

  if (response) {
    doc.fontSize(7).font('Helvetica-Bold').fillColor(C.muted).text('RESPONSE CONTOH (200 / 201):', 44, doc.y);
    const boxY = doc.y + 2;
    const lines = response.split('\n');
    const height = lines.length * 9.5 + 6;
    doc.roundedRect(44, boxY, 507, height, 2).fill(C.codeBg);
    doc.fontSize(7).font('Courier').fillColor(C.codeText).text(response, 48, boxY + 3, { width: 499, lineGap: 0.8 });
    doc.y = boxY + height + 3;
  }

  doc.moveDown(0.25);
}

// ==================== HALAMAN 1 ====================
renderHeader('AFFAN STORE - API SPECIFICATION', 'Panduan Lengkap Integrasi Front End • NestJS + Prisma ORM + JWT Auth');

renderSectionTitle('1. Konfigurasi Lingkungan & Parameter Dasar');

const envStartY = doc.y;
doc.roundedRect(40, envStartY, 515, 74, 4).fill(C.cardBg).strokeColor(C.border).lineWidth(0.8).stroke();

doc.fontSize(8).font('Helvetica-Bold').fillColor(C.muted).text('BASE URL (LOKAL):', 50, envStartY + 8);
doc.fontSize(8.5).font('Courier-Bold').fillColor(C.accent).text('http://localhost:3000', 170, envStartY + 8);

doc.fontSize(8).font('Helvetica-Bold').fillColor(C.muted).text('SWAGGER DOCS:', 50, envStartY + 24);
doc.fontSize(8.5).font('Courier-Bold').fillColor(C.accent).text('http://localhost:3000/api', 170, envStartY + 24);

doc.fontSize(8).font('Helvetica-Bold').fillColor(C.muted).text('STATIC ASSETS (IMG):', 50, envStartY + 40);
doc.fontSize(8.5).font('Courier-Bold').fillColor(C.accent).text('http://localhost:3000/uploads/<filename>', 170, envStartY + 40);

doc.fontSize(8).font('Helvetica-Bold').fillColor(C.muted).text('HEADER AUTH:', 50, envStartY + 56);
doc.fontSize(8.5).font('Courier-Bold').fillColor(C.accent).text('Authorization: Bearer <access_token>', 170, envStartY + 56);

doc.y = envStartY + 80;

doc.roundedRect(40, doc.y, 515, 24, 3).fill(C.warningBg);
doc.fontSize(7.5).font('Helvetica-Bold').fillColor(C.warningText)
   .text('STATUS CORS: app.enableCors() sudah aktif. Request dari localhost frontend tidak akan diblokir browser.', 48, doc.y + 6.5, { width: 500 });
doc.y += 30;

renderSectionTitle('2. Master Data & Enums Acuan');

const enumStartY = doc.y;
doc.rect(40, enumStartY, 515, 17).fill(C.primary);
doc.fontSize(7.5).font('Helvetica-Bold').fillColor('#FFFFFF');
doc.text('NAMA ENUM', 48, enumStartY + 4.5);
doc.text('NILAI YANG VALID', 160, enumStartY + 4.5);
doc.text('KETERANGAN / FUNGSIONALITAS', 310, enumStartY + 4.5);

let curY = enumStartY + 17;
const enums = [
  { name: 'Role', val: 'USER, ADMIN', desc: 'Hak akses akun. Default saat registrasi adalah USER' },
  { name: 'PaymentMethod', val: 'CASH, QRIS', desc: 'Metode pembayaran pesanan checkout' },
  { name: 'ShippingType', val: 'COD, NON_COD', desc: 'Tipe pengiriman barang pesanan' },
  { name: 'OrderStatus', val: 'PENDING, PAID, CANCELLED', desc: 'Status siklus perjalanan transaksi' },
];

enums.forEach((e) => {
  doc.rect(40, curY, 515, 15).fill(curY % 30 === 0 ? '#FFFFFF' : C.cardBg);
  doc.fontSize(7.5).font('Helvetica-Bold').fillColor(C.primary).text(e.name, 48, curY + 3.5);
  doc.fontSize(7.5).font('Courier-Bold').fillColor(C.accent).text(e.val, 160, curY + 3.5);
  doc.fontSize(7.2).font('Helvetica').fillColor(C.text).text(e.desc, 310, curY + 3.5);
  curY += 15;
});

doc.y = curY + 8;

renderSectionTitle('3. Aturan Bisnis Transaksi (Business Logic)');
doc.roundedRect(40, doc.y, 515, 74, 4).fill(C.cardBg).strokeColor(C.border).lineWidth(0.8).stroke();
doc.fontSize(7.8).font('Helvetica').fillColor(C.text).text(
  '1. Sinkronisasi Metode Bayar & Pengiriman (Validasi Strict Backend):\n' +
  '   • Jika paymentMethod = "CASH", maka shippingType WAJIB bernilai "COD".\n' +
  '   • Jika paymentMethod = "QRIS", maka shippingType WAJIB bernilai "NON_COD".\n' +
  '   • Kombinasi yang tidak cocok akan ditolak otomatis dengan response 400 Bad Request.\n' +
  '2. Atomic Database Transaction (Pengurangan Stok Otomatis):\n' +
  '   • Stok produk langsung dipotong saat order terbuat secara atomic dalam $transaction.\n' +
  '3. Restock Otomatis pada Pembatalan:\n' +
  '   • Jika order PENDING dibatalkan (oleh User atau Admin), stok dikembalikan otomatis.',
  48, doc.y + 6, { width: 500, lineGap: 1.5 }
);

// Halaman 2: Auth & Katalog Produk
doc.addPage();

renderSectionTitle('4. Modul Autentikasi Pengguna (/auth)');

renderEndpoint(
  'POST',
  '/auth/register',
  'Public',
  'Mendaftarkan customer baru ke dalam sistem. Role otomatis diset ke USER.',
  '{\n  "name": "Budi Santoso",\n  "email": "budi@example.com",\n  "password": "password123" // min 6 karakter\n}',
  '{\n  "id": 1,\n  "name": "Budi Santoso",\n  "email": "budi@example.com",\n  "role": "USER",\n  "createdAt": "2026-10-06T06:00:00.000Z"\n}'
);

renderEndpoint(
  'POST',
  '/auth/login',
  'Public',
  'Login akun untuk mendapatkan Bearer JWT Access Token.',
  '{\n  "email": "budi@example.com",\n  "password": "password123"\n}',
  '{\n  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",\n  "user": { "id": 1, "name": "Budi Santoso", "email": "budi@example.com", "role": "USER" }\n}'
);

renderSectionTitle('5. Modul Katalog Produk (/products)');

renderEndpoint(
  'GET',
  '/products',
  'Public',
  'Mengambil seluruh daftar produk aktif toko, diurutkan dari yang terbaru (createdAt: desc).',
  null,
  '[\n  {\n    "id": 1,\n    "name": "Sepatu Running Adidas",\n    "price": 650000,\n    "category": "Sepatu",\n    "stock": 15,\n    "imageUrl": "/uploads/product-171800-123.jpg",\n    "isActive": true\n  }\n]'
);

renderEndpoint(
  'GET',
  '/products/:id',
  'Public',
  'Melihat detail lengkap 1 produk spesifik berdasarkan parameter ID produk.',
  null,
  '{\n  "id": 1,\n  "name": "Sepatu Running Adidas",\n  "description": "Bahan empuk",\n  "price": 650000,\n  "category": "Sepatu",\n  "stock": 15,\n  "imageUrl": "/uploads/product-171800-123.jpg"\n}'
);

// Halaman 3: Produk Admin
doc.addPage();

renderSectionTitle('5. Modul Produk (Lanjutan - Khusus Admin)');

renderEndpoint(
  'POST',
  '/products',
  'Admin Only',
  'Tambah produk baru. Request WAJIB multipart/form-data jika mengunggah file gambar (field: image).',
  'Form-Data Fields:\n• name (text, wajib), price (number, wajib), category (text, wajib), stock (number, wajib)\n• description (text, opsional), image (file binary, opsional: JPG/PNG)',
  '{\n  "id": 2,\n  "name": "Tas Ransel",\n  "price": 250000,\n  "category": "Tas",\n  "stock": 20,\n  "imageUrl": "/uploads/product-171999-456.png"\n}'
);

renderEndpoint(
  'PATCH',
  '/products/:id',
  'Admin Only',
  'Update produk / ganti foto produk (multipart/form-data. Kirim properti yang ingin diubah saja).'
);

renderEndpoint(
  'DELETE',
  '/products/:id',
  'Admin Only',
  'Menghapus data produk dari katalog berdasarkan ID produk.'
);

// Halaman 4: Orders
doc.addPage();

renderSectionTitle('6. Modul Pemesanan & Transaksi (/orders)');

renderEndpoint(
  'POST',
  '/orders',
  'User Login',
  'Checkout pesanan baru. Mengurangi stok produk secara atomic di database.',
  '{\n  "productId": 1,\n  "quantity": 2,\n  "paymentMethod": "QRIS",   // Pilihan: "CASH" atau "QRIS"\n  "shippingType": "NON_COD"  // Wajib "NON_COD" jika QRIS; Wajib "COD" jika CASH\n}',
  '{\n  "id": 10,\n  "userId": 1,\n  "totalAmount": 1300000,\n  "paymentMethod": "QRIS",\n  "shippingType": "NON_COD",\n  "status": "PENDING",\n  "orderItems": [\n    { "productId": 1, "quantity": 2, "price": 650000, "product": { "name": "Sepatu Running" } }\n  ]\n}'
);

renderEndpoint(
  'GET',
  '/orders',
  'User Login',
  'Menampilkan riwayat pesanan milik pengguna yang sedang terautentikasi (beserta detail produk).',
  null,
  '[\n  {\n    "id": 10,\n    "totalAmount": 1300000,\n    "status": "PENDING",\n    "orderItems": [{ "product": { "name": "Sepatu Running Adidas" } }]\n  }\n]'
);

renderEndpoint(
  'GET',
  '/orders/:id',
  'User / Admin',
  'Melihat detail 1 pesanan berdasarkan ID. Dibatasi hanya untuk pemilik pesanan atau akun Admin.'
);

renderEndpoint(
  'PATCH',
  '/orders/:id/cancel',
  'Pemilik Order',
  'Membatalkan pesanan sendiri jika status masih PENDING. Stok produk langsung otomatis dikembalikan.',
  null,
  '{\n  "id": 10,\n  "status": "CANCELLED",\n  "updatedAt": "2026-10-06T06:20:00.000Z"\n}'
);

renderEndpoint(
  'GET',
  '/orders/admin/all',
  'Admin Only',
  'Melihat seluruh pesanan dari semua pengguna (lengkap dengan data akun pemesan & barang yang dibeli).'
);

renderEndpoint(
  'PATCH',
  '/orders/:id/status',
  'Admin Only',
  'Mengubah status pesanan oleh admin (contoh: verifikasi PAID atau pembatalan CANCELLED).',
  '{\n  "status": "PAID" // Nilai valid: "PENDING" | "PAID" | "CANCELLED"\n}',
  '{\n  "id": 10,\n  "status": "PAID",\n  "updatedAt": "2026-10-06T06:25:00.000Z"\n}'
);

// Halaman 5: Users & Axios
doc.addPage();

renderSectionTitle('7. Modul Manajemen Pengguna (/users)');

const userStartY = doc.y;
doc.rect(40, userStartY, 515, 17).fill(C.primary);
doc.fontSize(7.5).font('Helvetica-Bold').fillColor('#FFFFFF');
doc.text('METHOD & ROUTE', 48, userStartY + 4.5);
doc.text('HAK AKSES', 210, userStartY + 4.5);
doc.text('FUNGSI & PENJELASAN', 320, userStartY + 4.5);

const userEndpoints = [
  { method: 'GET', route: '/users', access: 'ADMIN ONLY', desc: 'Melihat seluruh daftar user terdaftar' },
  { method: 'POST', route: '/users', access: 'ADMIN ONLY', desc: 'Admin membuat user baru secara manual' },
  { method: 'GET', route: '/users/:id', access: 'USER / ADMIN', desc: 'Melihat detail data profil spesifik' },
  { method: 'PATCH', route: '/users/:id', access: 'USER / ADMIN', desc: 'Update profil (nama, email, password)' },
  { method: 'DELETE', route: '/users/:id', access: 'ADMIN ONLY', desc: 'Menghapus akun pengguna dari database' },
];

let curUY = userStartY + 17;
userEndpoints.forEach((ep) => {
  doc.rect(40, curUY, 515, 15).fill(curUY % 30 === 0 ? '#FFFFFF' : C.cardBg);
  const color = ep.method === 'GET' ? C.get : ep.method === 'POST' ? C.post : ep.method === 'PATCH' ? C.patch : C.del;
  doc.fontSize(7.5).font('Helvetica-Bold').fillColor(color).text(ep.method, 48, curUY + 3.5);
  doc.fontSize(7.8).font('Courier-Bold').fillColor(C.primary).text(ep.route, 88, curUY + 3.5);
  doc.fontSize(7.2).font('Helvetica-Bold').fillColor(ep.access.includes('ADMIN ONLY') ? C.del : C.accent).text(ep.access, 210, curUY + 3.5);
  doc.fontSize(7.5).font('Helvetica').fillColor(C.text).text(ep.desc, 320, curUY + 3.5);
  curUY += 15;
});

doc.y = curUY + 10;

renderSectionTitle('8. Rekomendasi Setup Front End (Axios Client)');

const codeAxios = 
  "// src/services/api.js\n" +
  "import axios from 'axios';\n\n" +
  "const api = axios.create({\n" +
  "  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',\n" +
  "});\n\n" +
  "// Otomatis pasang Bearer Token jika user sudah login\n" +
  "api.interceptors.request.use((config) => {\n" +
  "  const token = localStorage.getItem('token');\n" +
  "  if (token) {\n" +
  "    config.headers.Authorization = `Bearer ${token}`;\n" +
  "  }\n" +
  "  return config;\n" +
  "});\n\n" +
  "// Interceptor respon jika token kadaluwarsa (401 Unauthorized)\n" +
  "api.interceptors.response.use(\n" +
  "  (response) => response,\n" +
  "  (error) => {\n" +
  "    if (error.response?.status === 401) {\n" +
  "      localStorage.removeItem('token');\n" +
  "      window.location.href = '/login';\n" +
  "    }\n" +
  "    return Promise.reject(error);\n" +
  "  }\n" +
  ");\n\n" +
  "export default api;";

const boxCodeY = doc.y;
const codeHeight = 275; // Memastikan seluruh baris termuat rapi
doc.roundedRect(40, boxCodeY, 515, codeHeight, 4).fill(C.codeBg);
doc.fontSize(7).font('Courier').fillColor(C.codeText).text(codeAxios, 48, boxCodeY + 8, { width: 499, lineGap: 0.8 });
doc.y = boxCodeY + codeHeight + 8;

// ==================== FOOTER ====================
const range = doc.bufferedPageRange();
const totalPages = range.count;

for (let i = range.start; i < range.start + totalPages; i++) {
  doc.switchToPage(i);
  const originalBottom = doc.page.margins.bottom;
  doc.page.margins.bottom = 0;

  doc.fontSize(7.5).font('Helvetica').fillColor(C.muted)
     .text(`AffanStore API Documentation • Halaman ${i + 1} dari ${totalPages}`, 40, 808, {
       align: 'center',
       width: 515,
       lineBreak: false,
     });

  doc.page.margins.bottom = originalBottom;
}

doc.end();

writeStream.on('finish', () => {
  console.log(`[OK] PDF successfully generated with EXACTLY ${totalPages} pages at: ${outputPath}`);
});
