// app/products/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { getAllProducts, formatPrice } from "../../lib/products";
import { countAvailableItemsByProduct } from "../../lib/productItems";

export default async function ProductsPage() {
  const products = await getAllProducts();

  // Hitung stok item (AVAILABLE) per product
  const productsWithStock = await Promise.all(
    products.map(async (p) => {
      const availableItemCount = await countAvailableItemsByProduct(p.id);
      return {
        ...p,
        availableItemCount,
      };
    })
  );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              All products
            </h1>
            <p className="mt-1 text-xs text-slate-600">
              Koleksi produk digital / akun / kode yang tersedia di Monarx Store.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-800 hover:bg-slate-50"
          >
            ← Back to home
          </Link>
        </div>

        {/* No products */}
        {productsWithStock.length === 0 ? (
          <p className="text-xs text-slate-500">
            Belum ada produk. Silakan tambahkan produk dari halaman admin.
          </p>
        ) : (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {productsWithStock.map((product) => {
              const isOutOfStock = product.availableItemCount <= 0;

              return (
                <article
                  key={product.id}
                  className="flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                >
                  {/* Image */}
                  <div className="h-40 w-full overflow-hidden border-b border-slate-100 bg-slate-100">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[11px] text-slate-400">
                        No image
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col gap-2 px-4 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h2 className="text-sm font-semibold text-slate-900 line-clamp-1">
                          {product.name}
                        </h2>
                        <p className="mt-0.5 text-[11px] text-slate-500 line-clamp-2">
                          {product.description || "No description."}
                        </p>
                      </div>
                    </div>

                    <div className="mt-1 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-[11px] text-slate-500">Price</p>
                        <p className="text-sm font-semibold text-red-600">
                          {formatPrice(product.price, product.currency)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] text-slate-500">Stock</p>
                        {isOutOfStock ? (
                          <span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700">
                            Out of stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                            {product.availableItemCount} available
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono text-slate-400">
                        /products/{product.slug}
                      </span>
                      <Link
                        href={`/products/${product.slug}`}
                        className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:bg-slate-300"
                        aria-disabled={isOutOfStock}
                      >
                        {isOutOfStock ? "View (sold out)" : "View"}
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}
