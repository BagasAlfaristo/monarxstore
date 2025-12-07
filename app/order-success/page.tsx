// app/order-success/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { getOrderWithItemsById } from "../../lib/orders";
import { getProductBySlug, formatPrice } from "../../lib/products";

interface OrderSuccessPageProps {
  searchParams: Promise<{
    orderId?: string;
  }>;
}

export default async function OrderSuccessPage({ searchParams }: OrderSuccessPageProps) {
  const params = await searchParams;
  const orderId = params.orderId;

  if (!orderId) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto max-w-lg px-4 py-16 text-center text-sm">
          <p>Order tidak ditemukan.</p>
        </div>
      </main>
    );
  }

  const order = await getOrderWithItemsById(orderId);

  if (!order) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto max-w-lg px-4 py-16 text-center text-sm">
          <p>Order tidak ditemukan.</p>
        </div>
      </main>
    );
  }

  const product = await getProductBySlug(order.productSlug);
  const firstItem = order.items[0]; // 1 order = 1 akun/kode

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-xl px-4 py-12 space-y-6">
        {/* Banner */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800">
          <p className="font-semibold">Pembayaran kamu berhasil (mock)</p>
          <p className="mt-1">
            Simpan baik-baik data akun / kode di bawah ini. Jangan dibagikan ke orang lain.
          </p>
        </div>

        {/* Info order & produk */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
          <h1 className="text-sm font-semibold text-slate-900">
            Order #{order.id.slice(0, 8)}
          </h1>

          {product && (
            <div className="space-y-1 text-xs">
              <p className="font-medium text-slate-800">{product.name}</p>
              <p className="text-slate-500">{product.slug}</p>
              <p className="text-slate-700">
                {formatPrice(product.price, product.currency)}
              </p>
            </div>
          )}

          <div className="mt-3 border-t border-slate-200 pt-3 text-xs space-y-1">
            <p className="font-medium text-slate-800">Dikirim ke</p>
            <p className="text-slate-700">{order.email}</p>
            {order.notes && (
              <p className="text-[11px] text-slate-500">Catatan: {order.notes}</p>
            )}
          </div>
        </section>

        {/* Akun / Redeem Code */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
          <h2 className="text-sm font-semibold text-slate-900">
            Akun / Redeem Code
          </h2>

          {firstItem ? (
            <>
              <p className="text-[11px] text-slate-500">
                Data di bawah ini berasal dari stok item untuk produk ini.
              </p>

              <div className="rounded-xl bg-slate-900 px-3 py-3 text-[11px] text-slate-50 font-mono break-all">
                {firstItem.value}
              </div>

              {firstItem.note && (
                <p className="text-[11px] text-slate-400">
                  Note: {firstItem.note}
                </p>
              )}
            </>
          ) : order.status !== "PAID" ? (
            <p className="text-xs text-amber-700">
              Order kamu masih{" "}
              <span className="font-semibold">{order.status}</span>.{" "}
              Akun / kode akan muncul di sini setelah status berubah menjadi{" "}
              <span className="font-semibold">PAID</span>.
            </p>
          ) : (
            <p className="text-xs text-rose-700">
              Order sudah <span className="font-semibold">PAID</span>, tetapi belum
              ada akun / kode yang ter-assign. Kemungkinan stok kosong atau terjadi
              error. Silakan hubungi admin.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
