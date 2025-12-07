// app/admin/orders/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { getAllOrdersWithItems } from "../../../lib/orders";
import { getProductBySlug, formatPrice } from "../../../lib/products";

export default async function AdminOrdersPage() {
  const orders = await getAllOrdersWithItems();

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

  const getStatusBadge = (status: string) => {
    if (status === "PAID") {
      return (
        <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
          PAID
        </span>
      );
    }
    if (status === "FAILED") {
      return (
        <span className="inline-flex rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700">
          FAILED
        </span>
      );
    }
    return (
      <span className="inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
        PENDING
      </span>
    );
  };

  const totalOrders = orders.length;
  const paid = orders.filter((o) => o.status === "PAID").length;
  const pending = orders.filter((o) => o.status === "PENDING").length;
  const failed = orders.filter((o) => o.status === "FAILED").length;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              Admin · Orders
            </h1>
            <p className="mt-1 text-xs text-slate-600">
              Riwayat penjualan / order yang masuk.
            </p>
          </div>
        </div>

        {/* Summary */}
        <section className="grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-medium text-slate-600">Orders</p>
            <p className="mt-2 text-2xl font-semibold">{totalOrders}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-medium text-slate-600">Paid</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-700">
              {paid}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-medium text-slate-600">Pending</p>
            <p className="mt-2 text-2xl font-semibold text-amber-700">
              {pending}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-medium text-slate-600">Failed</p>
            <p className="mt-2 text-2xl font-semibold text-rose-700">
              {failed}
            </p>
          </div>
        </section>

        {/* Orders table */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-slate-800">
              Order history
            </h2>
            <p className="text-[11px] text-slate-500">
              Urutan terbaru di atas.
            </p>
          </div>

          {orders.length === 0 ? (
            <p className="text-xs text-slate-500">
              Belum ada order. Coba buat order dari halaman produk.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] text-slate-600">
                    <th className="p-2 text-left font-medium">Waktu</th>
                    <th className="p-2 text-left font-medium">Produk</th>
                    <th className="p-2 text-left font-medium">Email</th>
                    <th className="p-2 text-left font-medium">Notes</th>
                    <th className="p-2 text-right font-medium">Harga</th>
                    <th className="p-2 text-left font-medium">Item</th>
                    <th className="p-2 text-center font-medium">Status</th>
                    <th className="p-2 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const product = productsMap.get(order.productSlug);
                    const firstItem = order.items[0];

                    return (
                      <tr
                        key={order.id}
                        className="border-b border-slate-100 hover:bg-slate-50/80"
                      >
                        <td className="p-2 align-middle text-[11px] text-slate-600">
                          {new Date(order.createdAt).toLocaleString("id-ID", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </td>
                        <td className="p-2 align-middle">
                          <div className="flex flex-col">
                            <span className="text-[11px] font-semibold">
                              {product?.name ?? order.productSlug}
                            </span>
                            <span className="mt-0.5 text-[10px] text-slate-500">
                              {order.productSlug}
                            </span>
                          </div>
                        </td>
                        <td className="p-2 align-middle text-[11px]">
                          {order.email}
                        </td>
                        <td className="p-2 align-middle text-[10px] text-slate-600 max-w-[200px]">
                          {order.notes || "-"}
                        </td>
                        <td className="p-2 align-middle text-right text-[11px]">
                          {product
                            ? formatPrice(product.price, product.currency)
                            : "-"}
                        </td>
                        <td className="p-2 align-middle text-[10px] max-w-[220px] truncate font-mono text-slate-700">
                          {firstItem ? firstItem.value : "-"}
                        </td>
                        <td className="p-2 align-middle text-center">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="p-2 align-middle text-right">
                          <form
                            action="/api/payment/mock"
                            method="post"
                            className="inline-flex gap-1"
                          >
                            <input
                              type="hidden"
                              name="orderId"
                              value={order.id}
                            />
                            <select
                              name="status"
                              defaultValue={order.status}
                              className="rounded-full border border-slate-300 bg-slate-50 px-2 py-1 text-[10px] outline-none"
                            >
                              <option value="PENDING">PENDING</option>
                              <option value="PAID">PAID</option>
                              <option value="FAILED">FAILED</option>
                            </select>
                            <button
                              type="submit"
                              className="rounded-full bg-slate-900 px-2 py-1 text-[10px] font-semibold text-white hover:bg-black"
                            >
                              Update
                            </button>
                          </form>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
