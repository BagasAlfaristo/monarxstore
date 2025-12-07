// app/admin/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { getAllProducts } from "../../lib/products";
import { getAllOrders } from "../../lib/orders";
import { countAvailableItemsByProduct } from "../../lib/productItems";

export default async function AdminDashboardPage() {
  const [products, orders] = await Promise.all([
    getAllProducts(),
    getAllOrders(),
  ]);

  const totalProducts = products.length;

  // Stock berdasarkan ProductItem (isUsed = false)
  const logicalStocks = await Promise.all(
    products.map((p) => countAvailableItemsByProduct(p.id))
  );
  const totalLogicalStock = logicalStocks.reduce((a, b) => a + b, 0);

  const totalOrders = orders.length;
  const paidOrders = orders.filter((o) => o.status === "PAID").length;
  const pendingOrders = orders.filter((o) => o.status === "PENDING").length;
  const failedOrders = orders.filter((o) => o.status === "FAILED").length;

  const grossRevenue = orders.reduce((sum, o) => {
    const p = products.find((p) => p.slug === o.productSlug);
    if (!p || o.status !== "PAID") return sum;
    return sum + p.price;
  }, 0);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Stats */}
        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-medium text-slate-600">
              Total Products
            </p>
            <p className="mt-2 text-2xl font-semibold">{totalProducts}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-medium text-slate-600">
              Total Stock (items)
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {totalLogicalStock}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-medium text-slate-600">
              Orders (PAID / ALL)
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {paidOrders}{" "}
              <span className="text-xs font-normal text-slate-500">
                / {totalOrders}
              </span>
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-medium text-slate-600">
              Est. Revenue (IDR)
            </p>
            <p className="mt-2 text-xl font-semibold">
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                maximumFractionDigits: 0,
              }).format(grossRevenue)}
            </p>
          </div>
        </div>

        {/* Order status summary */}
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs shadow-sm">
            <p className="font-semibold text-slate-700">Pending orders</p>
            <p className="mt-2 text-2xl font-semibold text-amber-600">
              {pendingOrders}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs shadow-sm">
            <p className="font-semibold text-slate-700">Paid orders</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-600">
              {paidOrders}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs shadow-sm">
            <p className="font-semibold text-slate-700">Failed orders</p>
            <p className="mt-2 text-2xl font-semibold text-rose-600">
              {failedOrders}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
