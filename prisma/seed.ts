// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "pg";

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ["warn", "error"],
});

async function main() {
  console.log("🌱 Seeding products...");

  // optional: kosongkan dulu
  await prisma.product.deleteMany();

  await prisma.product.createMany({
    data: [
      {
        slug: "chatgpt-plus",
        name: "ChatGPT Plus 1 Month",
        description:
          "Premium access to ChatGPT Plus for 30 days. Fast responses & priority capacity.",
        price: 200000,
        currency: "IDR",
        stock: 99,
        imageUrl:
          "https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=800",
        featured: true,
      },
      {
        slug: "claude-pro",
        name: "Claude Pro 1 Month",
        description:
          "Anthropic Claude Pro subscription for research and long-context analysis.",
        price: 220000,
        currency: "IDR",
        stock: 42,
        imageUrl:
          "https://images.pexels.com/photos/1181243/pexels-photo-1181243.jpeg?auto=compress&cs=tinysrgb&w=800",
        featured: true,
      },
      {
        slug: "gemini-advanced",
        name: "Gemini Advanced 1 Month",
        description:
          "Google Gemini Advanced with strong Google ecosystem integration.",
        price: 210000,
        currency: "IDR",
        stock: 33,
        imageUrl:
          "https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800",
        featured: true,
      },
      {
        slug: "midjourney-plan",
        name: "Midjourney Starter Plan",
        description:
          "Starter Midjourney image generation credits for creative projects.",
        price: 150000,
        currency: "IDR",
        stock: 20,
        imageUrl:
          "https://images.pexels.com/photos/2706379/pexels-photo-2706379.jpeg?auto=compress&cs=tinysrgb&w=800",
        featured: true,
      },
    ],
  });

  console.log("✅ Seed selesai — products inserted.");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
