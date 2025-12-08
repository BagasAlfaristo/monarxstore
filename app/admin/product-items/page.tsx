// app/admin/product-items/page.tsx
import { getAllProducts } from "@/lib/products";
import {
  getLatestProductItems,
  getProductItemsByProduct,
} from "@/lib/productItems";

interface AdminProductItemsPageProps {
  searchParams: Promise<{
    productId?: string;
    error?: string;
    success?: string;
  }>;
}

export default async function AdminProductItemsPage({
  searchParams,
}: AdminProductItemsPageProps) {
  // ⬅️ WAJIB: unwrap Promise dari Next
  const { productId, error, success } = await searchParams;

  const products = await getAllProducts();

  // selectedProduct sekarang tipe-nya: Product | null
  const selectedProduct =
    productId ? products.find((p) => p.id === productId) ?? null : null;

  const items = selectedProduct
    ? await getProductItemsByProduct(selectedProduct.id)
    : await getLatestProductItems(100);

  const errorMessage =
    error === "invalid_mode"
      ? "Invalid operation mode."
      : error === "missing_fields"
        ? "Please select product, type and paste at least one line."
        : error === "invalid_type"
          ? "Invalid item type."
          : error === "missing_id"
            ? "Missing item id."
            : error === "unknown"
              ? "An unexpected error occurred while processing items."
              : null;

  const successMessage =
    success === "created"
      ? "Product items created successfully."
      : success === "nothing"
        ? "No valid lines found. Nothing was created."
        : success === "deleted"
          ? "Item deleted."
          : success === "toggled"
            ? "Item status updated."
            : null;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">
          Product Items
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage raw accounts / codes for each product. Stock is calculated
          from items that are not used.
        </p>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {errorMessage}
        </div>
      )}
      {successMessage && !errorMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {successMessage}
        </div>
      )}

      {/* Filter by product */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <form className="flex flex-wrap items-center gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">
              Filter by product
            </label>
            <select
              name="productId"
              defaultValue={productId ?? ""}
              className="min-w-[220px] rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
            >
              <option value="">All products (latest items)</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="mt-5 inline-flex items-center rounded-full bg-slate-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-black"
          >
            Apply filter
          </button>
        </form>
      </section>

      {/* Create bulk items */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">
          Add product items (bulk)
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          One line per item. Format: <code>value;optional note</code>. Example:
          <br />
          <code>email@example.com;pass123;US region</code> or{" "}
          <code>CODE-123-ABC;Monthly plan</code>
        </p>

        <form
          action="/api/admin/product-items"
          method="POST"
          className="mt-4 grid gap-3 md:grid-cols-[2fr_1fr]"
        >
          <input type="hidden" name="mode" value="create_bulk" />

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">
              Product
            </label>
            <select
              name="productId"
              defaultValue={selectedProduct?.id ?? ""}
              required
              className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
            >
              <option value="" disabled>
                Select product…
              </option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">
              Type
            </label>
            <select
              name="type"
              defaultValue="ACCOUNT"
              className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
              required
            >
              <option value="ACCOUNT">ACCOUNT</option>
              <option value="CODE">CODE</option>
            </select>
          </div>

          <div className="md:col-span-2 space-y-1">
            <label className="text-xs font-medium text-slate-700">
              Lines
            </label>
            <textarea
              name="lines"
              rows={6}
              className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm font-mono"
              placeholder={`email@example.com;password123;note\nemail2@example.com;password456;note2`}
              required
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="inline-flex rounded-full bg-slate-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-black"
            >
              Import items
            </button>
          </div>
        </form>
      </section>

      {/* Items list */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">
          {productId && selectedProduct
            ? `Items for ${selectedProduct.name}`
            : "Latest product items"}
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          You can mark items as used or delete them. Value is partially hidden
          for safety.
        </p>

        {items.length === 0 ? (
          <p className="mt-3 text-xs text-slate-500">
            No items found for this filter.
          </p>
        ) : (
          <div className="mt-4 space-y-2">
            {items.map((item) => {
              const masked =
                item.value.length > 40
                  ? item.value.slice(0, 37) + "..."
                  : item.value;

              return (
                <div
                  key={item.id}
                  className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs md:flex-row md:items-center md:justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-medium uppercase text-white">
                        {item.type}
                      </span>
                      <span className="font-semibold text-slate-800">
                        {item.product.name}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="font-mono text-[11px] text-slate-800">
                      {masked}
                    </div>
                    {item.note && (
                      <div className="text-[11px] text-slate-500">
                        Note: {item.note}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <form
                      action="/api/admin/product-items"
                      method="POST"
                      className="flex items-center gap-1"
                    >
                      <input type="hidden" name="mode" value="toggle_used" />
                      <input type="hidden" name="id" value={item.id} />
                      {productId && (
                        <input
                          type="hidden"
                          name="productId"
                          value={productId}
                        />
                      )}
                      <input
                        type="hidden"
                        name="isUsed"
                        value={item.isUsed ? "false" : "true"}
                      />
                      <button
                        type="submit"
                        className={`rounded-full px-3 py-1 text-[11px] font-medium ${item.isUsed
                            ? "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                            : "bg-emerald-600 text-white hover:bg-emerald-500"
                          }`}
                      >
                        {item.isUsed ? "Mark unused" : "Mark used"}
                      </button>
                    </form>

                    <form
                      action="/api/admin/product-items"
                      method="POST"
                      className="flex items-center gap-1"
                    >
                      <input type="hidden" name="mode" value="delete" />
                      <input type="hidden" name="id" value={item.id} />
                      {productId && (
                        <input
                          type="hidden"
                          name="productId"
                          value={productId}
                        />
                      )}
                      <button
                        type="submit"
                        className="text-[11px] text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </form>

                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] ${item.isUsed
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}
                    >
                      {item.isUsed ? "USED" : "AVAILABLE"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
