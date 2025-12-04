//home/zyan/Coding/monarxstore/monarxstore/app/admin/orders/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;
import Link from "next/link";
import { getAllOrders } from "../../../lib/orders";
import { getProductBySlug, formatPrice } from "../../../lib/products";

export default async function AdminOrdersPage() {
  const orders = await getAllOrders();   // ← tambahin await

  const productsMap = new Map<
    string,
    Awaited<ReturnType<typeof getProductBySlug>>
  >();

  for (const order of orders) {
    if (!productsMap.has(order.productSlug)) {
      const p = await getProductBySlug(order.productSlug);
      productsMap.set(order.productSlug, p);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h1 className="text-lg font-semibold tracking-tight">
            Admin · Orders
          </h1>
          <div className="flex gap-2">
            <Link
              href="/"
              className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-800 hover:bg-slate-50"
            >
              Home
            </Link>
            <Link
              href="/products"
              className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-800 hover:bg-slate-50"
            >
              Products
            </Link>
          </div>
        </div>

        {orders.length === 0 ? (
          <p className="text-xs text-slate-500">
            Belum ada order. Coba buat order dari halaman produk.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] text-slate-500">
                  <th className="px-3 py-2 text-left">Order ID</th>
                  <th className="px-3 py-2 text-left">Created</th>
                  <th className="px-3 py-2 text-left">Email</th>
                  <th className="px-3 py-2 text-left">Product</th>
                  <th className="px-3 py-2 text-left">Price</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => {
                  const p = productsMap.get(o.productSlug) ?? null;
                  const isPending = o.status === "PENDING";
                  return (
                    <tr
                      key={o.id}
                      className="border-b border-slate-100 hover:bg-slate-50/70"
                    >
                      <td className="px-3 py-2 font-mono text-[11px] text-slate-700">
                        {o.id}
                      </td>
                      <td className="px-3 py-2 text-[11px] text-slate-500">
                        {o.createdAt.toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-[11px] text-slate-800">
                        {o.email}
                      </td>
                      <td className="px-3 py-2 text-[11px] text-slate-800">
                        {p ? p.name : o.productSlug}
                      </td>
                      <td className="px-3 py-2 text-[11px] text-slate-800">
                        {p ? formatPrice(p.price, p.currency) : "-"}
                      </td>
                      <td className="px-3 py-2 text-[11px]">
                        <span
                          className={
                            "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold " +
                            (o.status === "PENDING"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : o.status === "PAID"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-red-50 text-red-700 border border-red-200")
                          }
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-[11px]">
                        {isPending ? (
                          <form
                            action="/api/payment/mock"
                            method="POST"
                            className="inline"
                          >
                            <input
                              type="hidden"
                              name="orderId"
                              value={o.id}
                            />
                            <input
                              type="hidden"
                              name="status"
                              value="PAID"
                            />
                            <button
                              type="submit"
                              className="rounded-full border border-emerald-500 px-3 py-1 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-50"
                            >
                              Mark as PAID
                            </button>
                          </form>
                        ) : (
                          <span className="text-[10px] text-slate-400">
                            No actions
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
