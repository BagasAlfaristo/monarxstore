// lib/orders.ts
import { prisma } from "./prisma";
import type { Order as PrismaOrder, OrderStatus as PrismaOrderStatus } from "@prisma/client";

export type OrderStatus = PrismaOrderStatus;
export type Order = PrismaOrder;

/**
 * Create order baru
 */
export async function createOrder(params: {
  productSlug: string;
  email: string;
  notes?: string;
}): Promise<Order> {
  const order = await prisma.order.create({
    data: {
      productSlug: params.productSlug,
      email: params.email,
      notes: params.notes?.trim() || undefined,
      // status & createdAt otomatis dari schema
    },
  });

  return order;
}

/**
 * Ambil order by ID
 */
export async function getOrderById(id: string): Promise<Order | null> {
  return prisma.order.findUnique({
    where: { id },
  });
}

/**
 * Ambil semua order (terbaru di atas)
 */
export async function getAllOrders(): Promise<Order[]> {
  return prisma.order.findMany({
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Update status order
 */
export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<Order | null> {
  try {
    const order = await prisma.order.update({
      where: { id },
      data: { status },
    });
    return order;
  } catch (e) {
    // kalau ID tidak ada, Prisma lempar error, kita balikin null
    return null;
  }
}
