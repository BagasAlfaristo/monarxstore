// lib/products.ts
import { prisma } from "./prisma";
import type { Product as PrismaProduct } from "@prisma/client";

export type Product = PrismaProduct;

export async function getFeaturedProducts(limit = 6): Promise<Product[]> {
  return prisma.product.findMany({
    where: { featured: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getAllProducts(): Promise<Product[]> {
  return prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getProductBySlug(
  slug: string
): Promise<Product | null> {
  return prisma.product.findUnique({
    where: { slug },
  });
}

export function formatPrice(price: number, currency: string): string {
  const locale =
    currency === "IDR"
      ? "id-ID"
      : currency === "CNY"
        ? "zh-CN"
        : "en-US";

  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  });

  return formatter.format(price);
}

// ==== Admin helpers ====

export async function createProduct(data: {
  name: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  imageUrl: string;
  featured?: boolean;
}) {
  return prisma.product.create({
    data: {
      slug: data.slug,
      name: data.name,
      description: data.description,
      price: data.price,
      currency: data.currency,
      imageUrl: data.imageUrl,
      featured: data.featured ?? false,
    },
  });
}

export async function updateProduct(
  id: string,
  data: {
    name?: string;
    slug?: string;
    description?: string;
    price?: number;
    currency?: string;
    imageUrl?: string;
    featured?: boolean;
  }
) {
  return prisma.product.update({
    where: { id },
    data,
  });
}

export async function deleteProduct(id: string): Promise<void> {
  await prisma.product.delete({
    where: { id },
  });
}
