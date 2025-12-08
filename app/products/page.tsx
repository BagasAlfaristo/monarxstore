// app/admin/products/page.tsx
import { getAllProducts } from "@/lib/products";
import { countAvailableItemsByProduct } from "@/lib/productItems";

interface AdminProductsPageProps {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
}

export default async function AdminProductsPage({
  searchParams,
}: AdminProductsPageProps) {
  // ⬅️ WAJIB: await searchParams
  const { error, success } = await searchParams;

  const products = await getAllProducts();
  const productsWithStock = await Promise.all(
    products.map(async (p) => {
      const available = await countAvailableItemsByProduct(p.id);
      return { ...p, available };
    })
  );

  const errorMessage =
    error === "slug_taken"
      ? "Slug already exists. Please use a different slug."
      : error === "missing_fields"
      ? "Please fill in all required fields (name, slug, price)."
      : error === "missing_id"
      ? "Missing product id."
      : error === "invalid_mode"
      ? "Invalid operation mode."
      : error === "unknown"
      ? "An unexpected error occurred while saving the product."
      : null;

  const successMessage =
    success === "create"
      ? "Product has been created."
      : success === "update"
      ? "Product has been updated."
      : success === "delete"
      ? "Product has been deleted."
      : null;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">
          Products Management
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Create, edit and delete AI products. Stock is calculated from linked
          product items.
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

      {/* CREATE PRODUCT FORM */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">
          Create new product
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Minimum: name, slug, price. Currency default USD.
        </p>

        <form
          action="/api/admin/products"
          method="POST"
          className="mt-4 grid gap-3 md:grid-cols-2"
        >
          <input type="hidden" name="mode" value="create" />

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">
              Name *
            </label>
            <input
              name="name"
              className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">
              Slug * (unique)
            </label>
            <input
              name="slug"
              className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">
              Price (base) *
            </label>
            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">
              Currency
            </label>
            <input
              name="currency"
              defaultValue="USD"
              className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
            />
          </div>

          <div className="md:col-span-2 space-y-1">
            <label className="text-xs font-medium text-slate-700">
              Image URL
            </label>
            <input
              name="imageUrl"
              className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
            />
          </div>

          <div className="md:col-span-2 space-y-1">
            <label className="text-xs font-medium text-slate-700">
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
            />
          </div>

          <div className="flex items-center gap-2 md:col-span-2">
            <input
              id="featured-create"
              type="checkbox"
              name="featured"
              value="true"
              className="h-4 w-4 rounded border-slate-300"
            />
            <label
              htmlFor="featured-create"
              className="text-xs text-slate-700"
            >
              Mark as featured
            </label>
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="inline-flex rounded-full bg-slate-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-black"
            >
              Save product
            </button>
          </div>
        </form>
      </section>

      {/* EXISTING PRODUCTS LIST + INLINE EDIT */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">
          Existing products
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Quick edit inline. Stock is derived from unused product items.
        </p>

        {productsWithStock.length === 0 ? (
          <p className="mt-3 text-xs text-slate-500">
            No products created yet.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {productsWithStock.map((p) => (
              <div
                key={p.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs text-slate-500">
                    <span className="font-semibold text-slate-800">
                      {p.name}
                    </span>{" "}
                    · slug:{" "}
                    <span className="font-mono text-[11px]">{p.slug}</span>{" "}
                    · stock:{" "}
                    <span className="font-semibold">
                      {p.available} available
                    </span>
                  </div>
                </div>

                <form
                  action="/api/admin/products"
                  method="POST"
                  className="mt-3 grid gap-2 md:grid-cols-[2fr_2fr_1fr_1fr_auto]"
                >
                  <input type="hidden" name="mode" value="update" />
                  <input type="hidden" name="id" value={p.id} />

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-600">
                      Name
                    </label>
                    <input
                      name="name"
                      defaultValue={p.name}
                      className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-600">
                      Slug
                    </label>
                    <input
                      name="slug"
                      defaultValue={p.slug}
                      className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-600">
                      Price
                    </label>
                    <input
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      defaultValue={p.price}
                      className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-600">
                      Currency
                    </label>
                    <input
                      name="currency"
                      defaultValue={p.currency}
                      className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs"
                    />
                  </div>

                  <div className="flex flex-col justify-between gap-1">
                    <div className="flex items-center gap-1">
                      <input
                        id={`featured-${p.id}`}
                        type="checkbox"
                        name="featured"
                        value="true"
                        defaultChecked={p.featured}
                        className="h-3 w-3 rounded border-slate-300"
                      />
                      <label
                        htmlFor={`featured-${p.id}`}
                        className="text-[11px] text-slate-600"
                      >
                        Featured
                      </label>
                    </div>
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center rounded-full bg-slate-900 px-3 py-1 text-[11px] font-medium text-white hover:bg-black"
                    >
                      Save
                    </button>
                  </div>
                </form>

                <form
                  action="/api/admin/products"
                  method="POST"
                  className="mt-2 flex justify-end"
                >
                  <input type="hidden" name="mode" value="delete" />
                  <input type="hidden" name="id" value={p.id} />
                  <button
                    type="submit"
                    className="text-[11px] text-red-600 hover:underline"
                  >
                    Delete product
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
