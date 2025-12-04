//home/zyan/Coding/monarxstore/monarxstore/app/admin/products/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;
import Link from "next/link";
import {
  getAllProducts,
  formatPrice,
} from "../../../lib/products";

export default async function AdminProductsPage() {
  const products = await getAllProducts();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              Admin · Products
            </h1>
            <p className="mt-1 text-xs text-slate-600">
              Kelola produk yang muncul di katalog & landing page.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/admin/orders"
              className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-800 hover:bg-slate-50"
            >
              Orders
            </Link>
            <Link
              href="/"
              className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-800 hover:bg-slate-50"
            >
              Home
            </Link>
          </div>
        </div>

        {/* NEW PRODUCT FORM */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-900">
            Add new product
          </p>
          <p className="mt-1 text-[11px] text-slate-600">
            Untuk demo cukup isi field sederhana. Slug harus unik.
          </p>

          <form
            action="/api/admin/products"
            method="POST"
            className="mt-3 grid gap-3 text-xs md:grid-cols-2"
          >
            <input type="hidden" name="mode" value="create" />

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-800">
                Slug
              </label>
              <input
                name="slug"
                required
                placeholder="chatgpt-plus"
                className="w-full rounded-full border border-slate-300 px-3 py-2 text-xs outline-none focus:border-red-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-800">
                Name
              </label>
              <input
                name="name"
                required
                placeholder="ChatGPT Plus 1 Month"
                className="w-full rounded-full border border-slate-300 px-3 py-2 text-xs outline-none focus:border-red-500"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-[11px] font-medium text-slate-800">
                Description
              </label>
              <textarea
                name="description"
                rows={2}
                required
                placeholder="Short description for buyers..."
                className="w-full rounded-2xl border border-slate-300 px-3 py-2 text-xs outline-none focus:border-red-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-800">
                Price (IDR)
              </label>
              <input
                name="price"
                type="number"
                min={0}
                step={1000}
                required
                placeholder="200000"
                className="w-full rounded-full border border-slate-300 px-3 py-2 text-xs outline-none focus:border-red-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-800">
                Stock
              </label>
              <input
                name="stock"
                type="number"
                min={0}
                required
                placeholder="99"
                className="w-full rounded-full border border-slate-300 px-3 py-2 text-xs outline-none focus:border-red-500"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-[11px] font-medium text-slate-800">
                Image URL
              </label>
              <input
                name="imageUrl"
                required
                placeholder="https://images.pexels.com/..."
                className="w-full rounded-full border border-slate-300 px-3 py-2 text-xs outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center gap-2 md:col-span-2">
              <label className="inline-flex items-center gap-2 text-[11px] text-slate-700">
                <input
                  type="checkbox"
                  name="featured"
                  className="h-3 w-3 rounded border-slate-300"
                />
                Mark as featured (tampil di landing page)
              </label>
              <span className="text-[10px] text-slate-400">
                Bisa diubah kapan saja.
              </span>
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                className="rounded-full bg-slate-900 px-5 py-2 text-[11px] font-semibold text-white hover:bg-black"
              >
                Add product
              </button>
            </div>
          </form>
        </div>

        {/* PRODUCTS TABLE */}
        {products.length === 0 ? (
          <p className="text-xs text-slate-500">
            Belum ada produk. Tambahkan dari form di atas.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] text-slate-500">
                  <th className="px-3 py-2 text-left">Name</th>
                  <th className="px-3 py-2 text-left">Slug</th>
                  <th className="px-3 py-2 text-left">Price</th>
                  <th className="px-3 py-2 text-left">Stock</th>
                  <th className="px-3 py-2 text-left">Featured</th>
                  <th className="px-3 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-slate-100 hover:bg-slate-50/70"
                  >
                    {/* Name + desc */}
                    <td className="px-3 py-2 align-top">
                      <div className="text-[11px] font-semibold text-slate-900">
                        {p.name}
                      </div>
                      <div className="mt-1 max-w-xs text-[10px] text-slate-500 line-clamp-2">
                        {p.description}
                      </div>
                    </td>

                    {/* Slug */}
                    <td className="px-3 py-2 align-top text-[11px] font-mono text-slate-600">
                      {p.slug}
                    </td>

                    {/* Price + edit */}
                    <td className="px-3 py-2 align-top text-[11px]">
                      <div>{formatPrice(p.price, p.currency)}</div>
                      <div className="mt-1">
                        <form
                          action="/api/admin/products"
                          method="POST"
                          className="flex items-center gap-1 text-[10px]"
                        >
                          <input type="hidden" name="mode" value="update" />
                          <input type="hidden" name="id" value={p.id} />
                          <input
                            type="number"
                            name="price"
                            defaultValue={p.price}
                            className="w-24 rounded-full border border-slate-300 px-2 py-1 text-[10px] outline-none focus:border-red-500"
                          />
                          <button
                            type="submit"
                            className="rounded-full border border-slate-300 px-2 py-1 text-[10px] text-slate-700 hover:bg-slate-50"
                          >
                            Save
                          </button>
                        </form>
                      </div>
                    </td>

                    {/* Stock + edit */}
                    <td className="px-3 py-2 align-top text-[11px]">
                      <form
                        action="/api/admin/products"
                        method="POST"
                        className="flex items-center gap-1 text-[10px]"
                      >
                        <input type="hidden" name="mode" value="update" />
                        <input type="hidden" name="id" value={p.id} />
                        <input
                          type="number"
                          name="stock"
                          defaultValue={p.stock}
                          className="w-16 rounded-full border border-slate-300 px-2 py-1 text-[10px] outline-none focus:border-red-500"
                        />
                        <button
                          type="submit"
                          className="rounded-full border border-slate-300 px-2 py-1 text-[10px] text-slate-700 hover:bg-slate-50"
                        >
                          Save
                        </button>
                      </form>
                    </td>

                    {/* Featured toggle */}
                    <td className="px-3 py-2 align-top text-[11px]">
                      <form
                        action="/api/admin/products"
                        method="POST"
                        className="flex items-center gap-1 text-[10px]"
                      >
                        <input type="hidden" name="mode" value="update" />
                        <input type="hidden" name="id" value={p.id} />

                        {/* Kirim nilai featured baru */}
                        <input
                          type="hidden"
                          name="featuredValue"
                          value={(!p.featured).toString()}
                        />

                        <span
                          className={
                            "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold " +
                            (p.featured
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-50 text-slate-500 border border-slate-200")
                          }
                        >
                          {p.featured ? "FEATURED" : "Normal"}
                        </span>

                        <button
                          type="submit"
                          className="rounded-full border border-slate-300 px-2 py-1 text-[10px] text-slate-700 hover:bg-slate-50"
                        >
                          Toggle
                        </button>
                      </form>
                    </td>

                    {/* Delete */}
                    <td className="px-3 py-2 align-top text-[11px]">
                      <form
                        action="/api/admin/products"
                        method="POST"
                      >
                        <input type="hidden" name="mode" value="delete" />
                        <input type="hidden" name="id" value={p.id} />
                        <button
                          type="submit"
                          className="rounded-full border border-red-300 px-3 py-1 text-[10px] font-semibold text-red-700 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
