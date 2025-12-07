// app/admin/products/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { getAllProducts, formatPrice } from "../../../lib/products";
import { countAvailableItemsByProduct } from "../../../lib/productItems";

export default async function AdminProductsPage() {
  const products = await getAllProducts();

  const productsWithItemStock = await Promise.all(
    products.map(async (p) => ({
      ...p,
      itemStock: await countAvailableItemsByProduct(p.id),
    }))
  );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
        {/* Create product form */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800">
            Tambah produk baru
          </h2>
          <p className="mt-1 text-[11px] text-slate-500">
            Gunakan satu produk sebagai “paket” — misalnya{" "}
            <span className="font-medium">Akun Netflix 1 Bulan</span>. Isi
            akun/kode per stok dikelola di halaman{" "}
            <span className="font-mono text-[10px]">Admin · Product Items</span>.
          </p>

          <form
            action="/api/admin/products"
            method="post"
            className="mt-4 grid gap-3 md:grid-cols-2"
          >
            {/* mode hidden */}
            <input type="hidden" name="mode" value="create" />

            {/* stock diset 0 by default, stok real ngikut jumlah item */}
            <input type="hidden" name="stock" value="0" />

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-700">
                Nama produk
              </label>
              <input
                name="name"
                required
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-slate-900"
                placeholder="Contoh: Akun Netflix 1 Bulan"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-700">
                Slug
              </label>
              <input
                name="slug"
                required
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-slate-900"
                placeholder="contoh: akun-netflix-1-bulan"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-700">
                Harga (IDR)
              </label>
              <input
                name="price"
                type="number"
                min={0}
                required
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-slate-900"
                placeholder="contoh: 35000"
              />
              <input type="hidden" name="currency" value="IDR" />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-[11px] font-medium text-slate-700">
                Deskripsi singkat
              </label>
              <textarea
                name="description"
                rows={2}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-slate-900"
                placeholder="Jelaskan tipe produk. Misal: berisi 1 akun (email;password;note) atau 1 redeem code (code;note)."
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-700">
                Image URL
              </label>
              <input
                name="imageUrl"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-slate-900"
                placeholder="https://..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-700">
                Featured
              </label>
              <select
                name="featured"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-slate-900"
                defaultValue="false"
              >
                <option value="false">Tidak</option>
                <option value="true">Tampilkan di beranda</option>
              </select>
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="rounded-full bg-slate-900 px-4 py-2 text-[11px] font-semibold text-white hover:bg-black"
              >
                Simpan produk
              </button>
            </div>
          </form>
        </section>

        {/* Products table */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-slate-800">
              Daftar produk
            </h2>
            <p className="text-[11px] text-slate-500">
              Total:{" "}
              <span className="font-semibold">
                {productsWithItemStock.length}
              </span>
            </p>
          </div>

          {productsWithItemStock.length === 0 ? (
            <p className="text-xs text-slate-500">
              Belum ada produk. Tambahkan minimal satu produk terlebih dahulu.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] text-slate-600">
                    <th className="p-2 text-left font-medium">Nama</th>
                    <th className="p-2 text-left font-medium">Slug</th>
                    <th className="p-2 text-right font-medium">Harga</th>
                    <th className="p-2 text-right font-medium">
                      Stock (items)
                    </th>
                    <th className="p-2 text-center font-medium">Featured</th>
                    <th className="p-2 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {productsWithItemStock.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-slate-100 hover:bg-slate-50/80"
                    >
                      <td className="p-2 align-middle">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-semibold">
                            {product.name}
                          </span>
                          {product.description && (
                            <span className="mt-0.5 line-clamp-2 text-[10px] text-slate-500">
                              {product.description}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-2 align-middle text-[11px] text-slate-600">
                        {product.slug}
                      </td>
                      <td className="p-2 align-middle text-right text-[11px]">
                        {formatPrice(product.price, product.currency)}
                      </td>
                      <td className="p-2 align-middle text-right text-[11px]">
                        {product.itemStock}
                      </td>
                      <td className="p-2 align-middle text-center text-[11px]">
                        {product.featured ? (
                          <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                            Featured
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
                            Normal
                          </span>
                        )}
                      </td>
                      <td className="p-2 align-middle text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Form update (inline minimal) */}
                          <form
                            action="/api/admin/products"
                            method="post"
                            className="flex items-center gap-1.5"
                          >
                            <input type="hidden" name="mode" value="update" />
                            <input type="hidden" name="id" value={product.id} />
                            <input
                              type="hidden"
                              name="slug"
                              defaultValue={product.slug}
                            />
                            <input
                              type="hidden"
                              name="name"
                              defaultValue={product.name}
                            />
                            <input
                              type="hidden"
                              name="price"
                              defaultValue={product.price}
                            />
                            <input
                              type="hidden"
                              name="currency"
                              defaultValue={product.currency}
                            />
                            {/* stock tetap dikirim, tapi kita biarkan 0 / nilai lama */}
                            <input
                              type="hidden"
                              name="stock"
                              defaultValue={product.stock ?? 0}
                            />
                            <input
                              type="hidden"
                              name="imageUrl"
                              defaultValue={product.imageUrl ?? ""}
                            />
                            <input
                              type="hidden"
                              name="description"
                              defaultValue={product.description ?? ""}
                            />
                            <input
                              type="hidden"
                              name="featured"
                              defaultValue={
                                product.featured ? "true" : "false"
                              }
                            />

                            <button
                              type="submit"
                              className="rounded-full border border-slate-300 px-2 py-1 text-[10px] font-semibold text-slate-700 hover:bg-slate-100"
                            >
                              Save
                            </button>
                          </form>

                          {/* Delete */}
                          <form action="/api/admin/products" method="post">
                            <input type="hidden" name="mode" value="delete" />
                            <input type="hidden" name="id" value={product.id} />
                            <button
                              type="submit"
                              className="rounded-full border border-rose-200 bg-rose-50 px-2 py-1 text-[10px] font-semibold text-rose-700 hover:bg-rose-100"
                            >
                              Delete
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
