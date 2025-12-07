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

// 🔴 INI BAGIAN PENTING: update status + assign item kalau PAID
export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  // 1) Update status dulu
  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });

  // 2) Kalau bukan PAID, nggak usah ambil item / kirim email
  if (status !== "PAID") {
    return updated;
  }

  // 3) Ambil order-nya lagi untuk baca productSlug
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    return updated;
  }

  // 4) Cari product berdasarkan slug
  const product = await prisma.product.findUnique({
    where: { slug: order.productSlug },
  });

  if (!product) {
    // kalau gak ketemu product, nggak bisa assign item
    return updated;
  }

  // 5) Assign 1 item AVAILABLE ke order ini
  await assignFirstAvailableItemToOrder({
    productId: product.id,
    orderId: order.id,
  });

  // 6) Ambil semua item yang sudah ter-assign ke order ini
  const items = await getItemsByOrder(order.id);

  // 7) Kirim email (dibungkus try/catch biar nggak ngerusak flow utama)
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

    const publicItems = items.map((item) => ({
      id: item.id,
      type: item.type,
      value: item.value,
      note: item.note,
    }));

    // Email 1: info bahwa pembayaran sukses
    await sendOrderPaidEmail({
      to: order.email,
      order: publicOrder,
      product: publicProduct,
    });

    // Email 2: delivery item (kalau ada)
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

  return updated;
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
