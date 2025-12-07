// lib/productItems.ts
import { prisma } from "./prisma";
import { ProductItemType } from "@prisma/client";

export async function getItemsByProduct(productId: string) {
  return prisma.productItem.findMany({
    where: { productId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAvailableItemsByProduct(productId: string) {
  return prisma.productItem.findMany({
    where: { productId, isUsed: false },
    orderBy: { createdAt: "asc" },
  });
}

export async function countAvailableItemsByProduct(productId: string) {
  return prisma.productItem.count({
    where: { productId, isUsed: false },
  });
}

export async function createProductItem(input: {
  productId: string;
  type: ProductItemType;
  value: string;
  note?: string | null;
}) {
  return prisma.productItem.create({
    data: {
      productId: input.productId,
      type: input.type,
      value: input.value,
      note: input.note,
    },
  });
}

/**
 * Untuk bulk insert: 1 baris = 1 akun/1 kode.
 * Contoh:
 *   email@example.com;pass123;note
 *   email2@example.com;pass456;note lain
 */
export async function createBulkProductItems(input: {
  productId: string;
  type: ProductItemType;
  rawText: string;
}) {
  const rows = input.rawText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (rows.length === 0) return { created: 0 };

  await prisma.productItem.createMany({
    data: rows.map((value) => ({
      productId: input.productId,
      type: input.type,
      value,
    })),
  });

  return { created: rows.length };
}

export async function deleteProductItem(id: string) {
  await prisma.productItem.delete({ where: { id } });
}

export async function assignFirstAvailableItemToOrder(params: {
  productId: string;
  orderId: string;
}) {
  // cari 1 item yang masih AVAILABLE
  const item = await prisma.productItem.findFirst({
    where: {
      productId: params.productId,
      isUsed: false,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (!item) {
    // tidak ada item tersedia → biarin saja, bisa kamu handle manual
    return null;
  }

  const updated = await prisma.productItem.update({
    where: { id: item.id },
    data: {
      isUsed: true,
      usedAt: new Date(),
      orderId: params.orderId,
    },
  });

  return updated;
}

export async function getItemsByOrder(orderId: string) {
  return prisma.productItem.findMany({
    where: { orderId },
    orderBy: { createdAt: "asc" },
  });
}