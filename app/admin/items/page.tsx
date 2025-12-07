// app/admin/items/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { getAllProducts } from "../../../lib/products";
import {
  getItemsByProduct,
  countAvailableItemsByProduct,
} from "../../../lib/productItems";

// tipe helper biar item tidak any
type ProductItem = Awaited<ReturnType<typeof getItemsByProduct>>[number];

interface AdminItemsPageProps {
  searchParams: Promise<{
    productId?: string;
  }>;
}

export default async function AdminItemsPage({ searchParams }: AdminItemsPageProps) {
  const params = await searchParams;

  const products = await getAllProducts();
  const productIdParam = params.productId;

  const selectedProductId =
    productIdParam && products.some((p) => p.id === productIdParam)
      ? productIdParam
      : products[0]?.id;

  const selectedProduct =
    products.find((p) => p.id === selectedProductId) || null;

  const items = selectedProduct
    ? await getItemsByProduct(selectedProduct.id)
    : [];

  const availableCount = selectedProduct
    ? await countAvailableItemsByProduct(selectedProduct.id)
    : 0;

  const usedCount = selectedProduct
    ? Math.max(0, items.length - availableCount)
    : 0;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
        {/* Select product */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-700">
                Pilih produk
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                Item akan dikaitkan ke produk ini. Stok logis = jumlah item
                yang belum terpakai.
              </p>
            </div>

            {/* form GET sederhana, tanpa onChange */}
            <form className="flex items-center gap-2" method="get">
              <select
                name="productId"
                defaultValue={selectedProductId}
                className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-slate-900"
              >
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-black"
              >
                Pilih
              </button>
            </form>
          </div>

          {selectedProduct && (
            <div className="rounded-xl bg-slate-50 px-3 py-2 text-[11px] text-slate-700">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-semibold">{selectedProduct.name}</div>
                  <div className="text-[10px] text-slate-500">
                    Slug: {selectedProduct.slug}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-500">
                    Total item:{" "}
                    <span className="font-semibold">{items.length}</span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Available (isUsed = false):{" "}
                    <span className="font-semibold">{availableCount}</span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Used (isUsed = true):{" "}
                    <span className="font-semibold">{usedCount}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Add item forms */}
        {selectedProduct && (
          <section className="grid gap-3 md:grid-cols-2">
            {/* Single add */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
              <h2 className="text-sm font-semibold text-slate-800">
                Tambah 1 item
              </h2>
              <p className="text-[11px] text-slate-500">
                Untuk akun: isi misalnya{" "}
                <span className="font-mono">
                  email@example.com;password123;note
                </span>
                . Untuk kode:{" "}
                <span className="font-mono">CODE-123-ABC;note</span>.
              </p>

              <form
                action="/api/admin/items"
                method="post"
                className="space-y-3"
              >
                <input type="hidden" name="mode" value="create" />
                <input
                  type="hidden"
                  name="productId"
                  value={selectedProduct.id}
                />

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-700">
                    Tipe item
                  </label>
                  <select
                    name="type"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-slate-900"
                    defaultValue="ACCOUNT"
                  >
                    <option value="ACCOUNT">
                      ACCOUNT (email;password;note)
                    </option>
                    <option value="CODE">CODE (code;note)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-700">
                    Isi (value)
                  </label>
                  <textarea
                    name="value"
                    rows={3}
                    required
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-slate-900 font-mono"
                    placeholder="email@example.com;password123;note opsional"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-700">
                    Note (opsional)
                  </label>
                  <input
                    name="note"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-slate-900"
                    placeholder="catatan tambahan (opsional)"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="rounded-full bg-slate-900 px-4 py-2 text-[11px] font-semibold text-white hover:bg-black"
                  >
                    Simpan item
                  </button>
                </div>
              </form>
            </div>

            {/* Bulk add */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
              <h2 className="text-sm font-semibold text-slate-800">
                Bulk add (banyak sekaligus)
              </h2>
              <p className="text-[11px] text-slate-500">
                1 baris = 1 item. Kamu bisa paste dari file / Excel.
              </p>

              <form
                action="/api/admin/items"
                method="post"
                className="space-y-3"
              >
                <input type="hidden" name="mode" value="create-bulk" />
                <input
                  type="hidden"
                  name="productId"
                  value={selectedProduct.id}
                />

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-700">
                    Tipe item
                  </label>
                  <select
                    name="type"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-slate-900"
                    defaultValue="ACCOUNT"
                  >
                    <option value="ACCOUNT">ACCOUNT</option>
                    <option value="CODE">CODE</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-700">
                    Daftar item
                  </label>
                  <textarea
                    name="rawText"
                    rows={8}
                    required
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-slate-900 font-mono"
                    placeholder={[
                      "email1@example.com;pass1;note1",
                      "email2@example.com;pass2;note2",
                      "CODE-ABC-123;note untuk kode",
                    ].join("\n")}
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="rounded-full bg-slate-900 px-4 py-2 text-[11px] font-semibold text-white hover:bg-black"
                  >
                    Simpan semua
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}

        {/* List items */}
        {selectedProduct && (
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-slate-800">
                Items untuk produk ini
              </h2>
              <p className="text-[11px] text-slate-500">
                {items.length} item total · {availableCount} available · {usedCount} used
              </p>
            </div>

            {items.length === 0 ? (
              <p className="text-xs text-slate-500">
                Belum ada item untuk produk ini.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[11px] text-slate-600">
                      <th className="p-2 text-left font-medium">Created</th>
                      <th className="p-2 text-left font-medium">Tipe</th>
                      <th className="p-2 text-left font-medium">Value</th>
                      <th className="p-2 text-left font-medium">Note</th>
                      <th className="p-2 text-center font-medium">Used</th>
                      <th className="p-2 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item: ProductItem) => {
                      const formId = `edit-${item.id}`;
                      return (
                        <tr
                          key={item.id}
                          className="border-b border-slate-100 hover:bg-slate-50/80"
                        >
                          <td className="p-2 align-middle text-[11px] text-slate-600">
                            {new Date(item.createdAt).toLocaleString("id-ID", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}
                          </td>
                          <td className="p-2 align-middle text-[11px]">
                            {item.type}
                          </td>
                          {/* Editable value */}
                          <td className="p-2 align-middle max-w-[260px]">
                            <textarea
                              name="value"
                              form={formId}
                              defaultValue={item.value}
                              rows={2}
                              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-2 py-1 text-[10px] font-mono outline-none focus:border-slate-900"
                            />
                          </td>
                          {/* Editable note */}
                          <td className="p-2 align-middle max-w-[220px]">
                            <input
                              name="note"
                              form={formId}
                              defaultValue={item.note || ""}
                              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-2 py-1 text-[10px] outline-none focus:border-slate-900"
                              placeholder="note (opsional)"
                            />
                          </td>
                          <td className="p-2 align-middle text-center text-[11px]">
                            {item.isUsed ? (
                              <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                USED
                              </span>
                            ) : (
                              <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
                                AVAILABLE
                              </span>
                            )}
                          </td>
                          <td className="p-2 align-middle text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* UPDATE FORM */}
                              <form
                                id={formId}
                                action="/api/admin/items"
                                method="post"
                                className="inline-flex items-center gap-1"
                              >
                                <input type="hidden" name="mode" value="update" />
                                <input type="hidden" name="id" value={item.id} />
                                <input
                                  type="hidden"
                                  name="productId"
                                  value={selectedProduct.id}
                                />
                                <button
                                  type="submit"
                                  className="rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700 hover:bg-blue-100"
                                >
                                  Save
                                </button>
                              </form>

                              {/* DELETE FORM */}
                              <form
                                action="/api/admin/items"
                                method="post"
                                className="inline-flex"
                              >
                                <input type="hidden" name="mode" value="delete" />
                                <input type="hidden" name="id" value={item.id} />
                                <input
                                  type="hidden"
                                  name="productId"
                                  value={selectedProduct.id}
                                />
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
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
