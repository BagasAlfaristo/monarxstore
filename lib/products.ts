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
  if (currency === "IDR") {
    return (
      "Rp " +
      price
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ".")
    );
  }
  return `${currency} ${price}`;
}

// ==== Admin helpers (dipakai route admin) ====

export async function createProduct(data: {
  slug: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  stock: number;
  imageUrl: string;
  featured?: boolean;
}): Promise<Product> {
  return prisma.product.create({
    data: {
      slug: data.slug,
      name: data.name,
      description: data.description,
      price: data.price,
      currency: data.currency,
      stock: data.stock,
      imageUrl: data.imageUrl,
      featured: !!data.featured,
    },
  });
}

export async function updateProduct(
  id: string,
  data: {
    slug?: string;
    name?: string;
    description?: string;
    price?: number;
    currency?: string;
    stock?: number;
    imageUrl?: string;
    featured?: boolean;
  }
): Promise<Product> {
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
