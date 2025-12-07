// app/products/[slug]/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, formatPrice } from "../../../lib/products";
import { getCurrentUser } from "@/lib/auth";
import { countAvailableItemsByProduct } from "../../../lib/productItems";

// params: Promise di Next 15+
type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const product = await getProductBySlug(slug);

  if (!product) {
    return notFound();
  }

  // 🔥 stok logis: jumlah ProductItem AVAILABLE
  const availableItemCount = await countAvailableItemsByProduct(product.id);
  const isOutOfStock = availableItemCount <= 0;

  const currentUser = await getCurrentUser();
  const isLoggedIn = !!currentUser;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-5 flex items-center justify-between gap-3">
          <Link
            href="/products"
            className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-800 hover:bg-slate-50"
          >
            ← Back to all products
          </Link>
          <Link
            href="/"
            className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-800 hover:bg-slate-50"
          >
            Home
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-[minmax(0,2.2fr)_minmax(0,3fr)]">
          {/* LEFT: Image */}
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="overflow-hidden rounded-2xl bg-slate-100">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-64 w-full object-cover md:h-80"
              />
            </div>
          </div>

          {/* RIGHT: Details + Checkout */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-red-500">
              AI PRODUCT
            </p>
            <h1 className="mt-2 text-lg font-semibold tracking-tight md:text-xl">
              {product.name}
            </h1>

            <div className="mt-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-slate-500">Price</p>
                <p className="text-xl font-semibold text-red-600">
                  {formatPrice(product.price, product.currency)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Stock</p>
                <p
                  className={
                    "text-sm font-semibold " +
                    (isOutOfStock ? "text-red-500" : "text-emerald-600")
                  }
                >
                  {isOutOfStock
                    ? "Out of stock"
                    : `${availableItemCount} available`}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <p className="text-xs font-semibold text-slate-900">
                Description
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                {product.description}
              </p>
            </div>

            {/* SIMPLE CHECKOUT FORM */}
            <div className="mt-6 border-t border-slate-200 pt-5">
              <p className="text-xs font-semibold text-slate-900">
                Checkout
              </p>
              <p className="mt-1 text-[11px] text-slate-600">
                {isLoggedIn
                  ? `Kami akan mengirim akses ke email akunmu (${currentUser!.email}).`
                  : "Masukkan email yang akan menerima akses / instruksi selanjutnya."}
              </p>

              <form
                action="/api/orders"
                method="POST"
                className="mt-3 space-y-3 text-xs"
              >
                {/* productSlug dikirim ke backend */}
                <input
                  type="hidden"
                  name="productSlug"
                  value={product.slug}
                />
                {/* optional kalau mau kirim nama juga */}
                <input
                  type="hidden"
                  name="productName"
                  value={product.name}
                />
                <input
                  type="hidden"
                  name="isLoggedIn"
                  value={isLoggedIn ? "true" : "false"}
                />

                {/* EMAIL */}
                <div className="space-y-1">
                  <label
                    htmlFor="email"
                    className="block text-[11px] font-medium text-slate-800"
                  >
                    Email
                  </label>

                  {isLoggedIn ? (
                    <>
                      {/* Kirim email user sebagai hidden input */}
                      <input
                        type="hidden"
                        name="email"
                        value={currentUser!.email || ""}
                      />
                      <p className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
                        {currentUser!.email}
                      </p>
                    </>
                  ) : (
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="you@example.com"
                      className="w-full rounded-full border border-slate-300 px-3 py-2 text-xs text-slate-900 outline-none placeholder:text-slate-400 focus:border-red-500"
                      disabled={isOutOfStock}
                    />
                  )}
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="notes"
                    className="block text-[11px] font-medium text-slate-800"
                  >
                    Notes (optional)
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={2}
                    placeholder="Contoh: Kirim panduan dalam bahasa Indonesia, dll."
                    className="w-full rounded-2xl border border-slate-300 px-3 py-2 text-xs text-slate-900 outline-none placeholder:text-slate-400 focus:border-red-500"
                    disabled={isOutOfStock}
                  />
                </div>

                <button
                  type="submit"
                  className="mt-2 rounded-full bg-red-600 px-5 py-2 font-semibold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-slate-300"
                  disabled={isOutOfStock}
                >
                  {isOutOfStock ? "Out of stock" : "Place order"}
                </button>

                <p className="text-[10px] text-slate-500">
                  Setelah ini kamu akan diarahkan ke halaman ringkasan order
                  (status: pending). Integrasi pembayaran & auto-delivery
                  bisa ditambahkan belakangan.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
