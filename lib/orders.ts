//home/zyan/Coding/monarxstore/monarxstore/lib/orders.ts
import { prisma } from "./prisma";

export type OrderStatus = "PENDING" | "PAID" | "FAILED";

export type Order = {
  id: string;
  productSlug: string;
  email: string;
  notes: string | null;
  status: OrderStatus;
  createdAt: Date;
};

function mapOrder(row: {
  id: string;
  productSlug: string;
  email: string;
  notes: string | null;
  status: string;
  createdAt: Date;
}): Order {
  return {
    id: row.id,
    productSlug: row.productSlug,
    email: row.email,
    notes: row.notes,
    status: row.status as OrderStatus,
    createdAt: row.createdAt,
  };
}

// Create order baru
export async function createOrder(params: {
  productSlug: string;
  email: string;
  notes?: string;
}): Promise<Order> {
  const row = await prisma.order.create({
    data: {
      productSlug: params.productSlug,
      email: params.email,
      notes: params.notes?.trim() || null,
    },
  });

  return mapOrder(row);
}

// Ambil order by ID
export async function getOrderById(id: string): Promise<Order | null> {
  const row = await prisma.order.findUnique({
    where: { id },
  });
  return row ? mapOrder(row) : null;
}

// Ambil semua order (paling baru di atas)
export async function getAllOrders(): Promise<Order[]> {
  const rows = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapOrder);
}

// Update status order
export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<Order | null> {
  const row = await prisma.order.update({
    where: { id },
    data: { status },
  });
  return row ? mapOrder(row) : null;
}
