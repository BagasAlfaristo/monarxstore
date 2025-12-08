// lib/productItems.ts
import { prisma } from "./prisma";
import type {
  ProductItem,
  Product,
  ProductItemType,
} from "@prisma/client";

export type ProductItemWithProduct = ProductItem & { product: Product };

// Dipakai homepage & admin/products
export async function countAvailableItemsByProduct(
  productId: string
): Promise<number> {
  return prisma.productItem.count({
    where: {
      productId,
      isUsed: false,
    },
  });
}

// --- Admin helpers list ---

export async function getLatestProductItems(
  limit = 100
): Promise<ProductItemWithProduct[]> {
  return prisma.productItem.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { product: true },
  });
}

export async function getProductItemsByProduct(
  productId: string
): Promise<ProductItemWithProduct[]> {
  return prisma.productItem.findMany({
    where: { productId },
    orderBy: { createdAt: "desc" },
    include: { product: true },
  });
}

// Semua item milik satu order (buat email & order-success)
export async function getItemsByOrder(
  orderId: string
): Promise<ProductItem[]> {
  return prisma.productItem.findMany({
    where: { orderId },
    orderBy: { createdAt: "asc" },
  });
}

// rawLines: tiap baris = "value;optional note"
export async function createProductItemsFromLines(params: {
  productId: string;
  type: ProductItemType;
  rawLines: string;
}): Promise<number> {
  const rows = params.rawLines
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .map((l) => {
      const [value, ...rest] = l.split(";");
      const note = rest.join(";").trim();
      return {
        value: value.trim(),
        note: note.length > 0 ? note : undefined,
      };
    })
    .filter((r) => r.value.length > 0);

  if (rows.length === 0) {
    return 0;
  }

  const result = await prisma.productItem.createMany({
    data: rows.map((r) => ({
      productId: params.productId,
      type: params.type,
      value: r.value,
      note: r.note,
    })),
  });

  return result.count;
}

// Assign 1 item AVAILABLE ke sebuah order (dipakai waktu order PAID)
export async function assignFirstAvailableItemToOrder(params: {
  productId: string;
  orderId: string;
}): Promise<void> {
  const { productId, orderId } = params;

  // cari item pertama yg belum dipakai & belum ada order
  const item = await prisma.productItem.findFirst({
    where: {
      productId,
      isUsed: false,
      orderId: null,
    },
    orderBy: { createdAt: "asc" },
  });

  if (!item) return;

  await prisma.productItem.update({
    where: { id: item.id },
    data: {
      isUsed: true,
      usedAt: new Date(),
      orderId,
    },
  });
}

// Toggle manual dari admin (mark used / unused)
export async function markProductItemUsed(options: {
  id: string;
  isUsed: boolean;
}): Promise<void> {
  const { id, isUsed } = options;

  await prisma.productItem.update({
    where: { id },
    data: {
      isUsed,
      usedAt: isUsed ? new Date() : null,
      // kalau di-set "unused" dari admin → lepas dari order agar bisa dipakai lagi
      ...(isUsed ? {} : { orderId: null }),
    },
  });
}

export async function deleteProductItem(id: string): Promise<void> {
  await prisma.productItem.delete({
    where: { id },
  });
}
