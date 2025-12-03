// app/products/page.tsx
import Link from "next/link";
import { getAllProducts, formatPrice } from "../../lib/products";

export const dynamic = "force-dynamic"; // optional, biar selalu fresh kalau DB-nya sering berubah

export default async function ProductsPage() {
  const products = await getAllProducts();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              All AI products
            </h1>
            <p className="mt-1 text-xs text-slate-600">
              Semua produk yang tersedia di katalog. Data diambil dari
              database.
            </p>
          </div>
          <Link
            href="/"
            className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-800 hover:bg-slate-50"
          >
            ← Back to home
          </Link>
        </div>

        {products.length === 0 ? (
          <p className="text-xs text-slate-500">
            Belum ada produk. Tambahkan produk di database dulu.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {products.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.slug}`}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-red-300"
              >
                <div className="mb-3 overflow-hidden rounded-xl bg-slate-100">
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="h-32 w-full object-cover"
                  />
                </div>
                <p className="text-xs font-semibold text-slate-900">
                  {p.name}
                </p>
                <p className="mt-1 flex-1 text-[11px] text-slate-600 line-clamp-3">
                  {p.description}
                </p>
                <div className="mt-3 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Price</span>
                  <span className="text-sm font-semibold text-red-600">
                    {formatPrice(p.price, p.currency)}
                  </span>
                </div>
                <div className="mt-1 text-[11px] text-slate-500">
                  Stock:{" "}
                  <span className={p.stock > 0 ? "" : "text-red-500"}>
                    {p.stock > 0 ? p.stock : "Out of stock"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
