// lib/orders.ts
import { prisma } from "./prisma";
import {
  assignFirstAvailableItemToOrder,
  getItemsByOrder,
} from "./productItems";
import {
  sendOrderPaidEmail,
  sendDeliveryEmail,
} from "./email";
import type {
  Order as PrismaOrder,
  PaymentMethod,
  ProductItem,
} from "@prisma/client";

export type OrderStatus = "PENDING" | "PAID" | "FAILED";

export type Order = {
  id: string;
  productSlug: string;
  email: string;
  notes: string | null;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;

  // snapshot harga + metode bayar
  amount: number; // integer, misal 15 = $15
  currency: string; // "USD" | "CNY" | "IDR" | dll
  paymentMethod: PaymentMethod | null;
};

function mapOrder(row: PrismaOrder): Order {
  return {
    id: row.id,
    productSlug: row.productSlug,
    email: row.email,
    notes: row.notes,
    status: row.status as OrderStatus,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    amount: row.amount,
    currency: row.currency,
    paymentMethod: row.paymentMethod ?? null,
  };
}

// Create order baru + snapshot harga
export async function createOrder(params: {
  productSlug: string;
  email: string;
  notes?: string;
  paymentMethod?: PaymentMethod | "ALIPAY" | "WECHAT" | "MANUAL";
  userId?: string | null;
}): Promise<Order> {
  const product = await prisma.product.findUnique({
    where: { slug: params.productSlug },
  });

  if (!product) {
    throw new Error(`Product with slug "${params.productSlug}" not found`);
  }

  // validasi userId kalau dikirim
  let userId: string | undefined;
  if (params.userId) {
    const user = await prisma.user.findUnique({
      where: { id: params.userId },
    });
    if (user) userId = user.id;
  }

  const row = await prisma.order.create({
    data: {
      productSlug: product.slug,
      email: params.email,
      notes: params.notes?.trim() || null,

      amount: Math.round(product.price),
      currency: product.currency,
      paymentMethod: (params.paymentMethod as PaymentMethod) ?? "MANUAL",
      userId,
    },
  });

  return mapOrder(row);
}

// Ambil order by ID (tanpa items)
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

// Update status + assign item kalau PAID
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<Order> {
  // 1) update status di DB
  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status: status as PrismaOrder["status"] },
  });

  // kalau bukan PAID, selesai
  if (status !== "PAID") {
    return mapOrder(updated);
  }

  // 2) ambil ulang order utk baca productSlug
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    return mapOrder(updated);
  }

  // 3) cari product
  const product = await prisma.product.findUnique({
    where: { slug: order.productSlug },
  });

  if (!product) {
    return mapOrder(updated);
  }

  // 4) assign satu item AVAILABLE ke order ini
  await assignFirstAvailableItemToOrder({
    productId: product.id,
    orderId: order.id,
  });

  // 5) ambil semua item di order ini
  const items = await getItemsByOrder(order.id);

  // 6) kirim email (dibungkus try/catch)
  try {
    const publicOrder = {
      id: order.id,
      createdAt: order.createdAt,
      email: order.email,
    };

    const publicProduct = {
      name: product.name,
      price: product.price,
      currency: product.currency,
      slug: product.slug,
    };

    const publicItems = items.map((item: ProductItem) => ({
      id: item.id,
      type: item.type,
      value: item.value,
      note: item.note,
    }));

    await sendOrderPaidEmail({
      to: order.email,
      order: publicOrder,
      product: publicProduct,
    });

    if (publicItems.length > 0) {
      await sendDeliveryEmail({
        to: order.email,
        order: publicOrder,
        product: publicProduct,
        items: publicItems,
      });
    }
  } catch (err) {
    console.error("[updateOrderStatus] gagal kirim email", err);
  }

  return mapOrder(updated);
}

// 1 order + items (buat order-success)
export async function getOrderWithItemsById(id: string) {
  const row = await prisma.order.findUnique({
    where: { id },
  });

  if (!row) return null;

  const items = await getItemsByOrder(row.id);

  return {
    ...mapOrder(row),
    items,
  };
}

// Semua order + items (buat admin/orders)
export async function getAllOrdersWithItems() {
  const rows = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
    },
  });

  return rows;
}

// Semua order milik email tertentu + product + items (buat /account)
export async function getOrdersWithItemsByEmail(email: string) {
  if (!email) return [];

  const rows = await prisma.order.findMany({
    where: { email },
    orderBy: { createdAt: "desc" },
    include: {
      product: true,
      items: true,
    },
  });

  return rows;
}