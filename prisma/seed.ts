import { PrismaClient } from '@prisma/client';
import 'dotenv/config'; // Pastikan dotenv sudah ter-import untuk mengambil env variables

const prisma = new PrismaClient();

async function main() {
  // Seed data produk dengan id manual
  await prisma.product.createMany({
    data: [
      {
        id: 'prod-101', // ID manual
        slug: 'product-ai-101',
        name: 'AI Product 101',
        description: 'A beginner AI product for learning purposes.',
        price: 500,
        currency: 'USD',
        stock: 50,
        imageUrl: 'https://example.com/product-ai-101.jpg',
        createdAt: new Date('2025-01-01T10:00:00Z'),
        updatedAt: new Date('2025-01-01T10:00:00Z'),
      },
      {
        id: 'prod-102', // ID manual
        slug: 'product-ai-102',
        name: 'AI Product 102',
        description: 'Intermediate AI product for tech enthusiasts.',
        price: 1000,
        currency: 'USD',
        stock: 30,
        imageUrl: 'https://example.com/product-ai-102.jpg',
        createdAt: new Date('2025-01-02T10:00:00Z'),
        updatedAt: new Date('2025-01-02T10:00:00Z'),
      },
      // Tambahkan produk lain sesuai kebutuhan
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
