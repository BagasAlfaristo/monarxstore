// app/account/orders/page.tsx
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

function formatStatus(status: string) {
  switch (status) {
    case "PAID":
      return "Paid";
    case "PENDING":
      return "Pending";
    case "FAILED":
      return "Failed";
    default:
      return status;
  }
}

export default async function AccountOrdersPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login?from=/account/orders");
  }

  // Pastikan user masih ada di DB
  const dbUser = await prisma.user.findUnique({
    where: { id: currentUser.id },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  if (!dbUser) {
    redirect("/login");
  }

  const orders = await prisma.order.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      createdAt: true,
      notes: true,
      product: {
        select: {
          name: true,
          price: true,
          currency: true,
          slug: true,
        },
      },
    },
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-600 text-[11px] font-bold text-white">
              AI
            </div>
            <span className="text-lg font-semibold tracking-tight">
              Monarx AI Store
            </span>
          </Link>

          <div className="flex items-center gap-3 text-[11px]">
            <Link
              href="/products"
              className="rounded-full border border-slate-200 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
            >
              AI Catalog
            </Link>
            <Link
              href="/account"
              className="rounded-full border border-slate-200 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
            >
              Account
            </Link>

            <form method="POST" action="/api/auth/logout">
              <button
                type="submit"
                className="rounded-full bg-slate-900 px-4 py-1.5 font-medium text-white hover:bg-black"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* BODY */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-8 space-y-5">
          {/* BREADCRUMB + TITLE */}
          <div className="space-y-2">
            <nav className="text-[11px] text-slate-500">
              <Link
                href="/account"
                className="hover:text-slate-900 hover:underline"
              >
                Account
              </Link>
              <span className="mx-1.5">/</span>
              <span className="font-medium text-slate-800">
                Order history
              </span>
            </nav>

            <div>
              <h1 className="text-base font-semibold text-slate-900">
                Order history
              </h1>
              <p className="text-[11px] text-slate-500">
                Riwayat semua transaksi yang terhubung dengan akun ini.
              </p>
            </div>
          </div>

          {/* EMPTY STATE */}
          {orders.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-5 py-8 text-center">
              <p className="text-sm font-medium text-slate-900">
                Belum ada transaksi
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                Setelah kamu melakukan pembelian, riwayatnya akan muncul di sini.
              </p>
              <div className="mt-4 flex justify-center">
                <Link
                  href="/products"
                  className="rounded-full bg-red-600 px-4 py-2 text-[11px] font-semibold text-white hover:bg-red-500"
                >
                  Mulai jelajahi produk AI
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-slate-900">
                  Transaksi terbaru
                </p>
                {/* Tempat filter nanti kalau mau */}
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-2 text-[11px]">
                  <thead>
                    <tr className="text-left text-slate-500">
                      <th className="px-2 py-1.5">Order</th>
                      <th className="px-2 py-1.5">Produk</th>
                      <th className="px-2 py-1.5">Tanggal</th>
                      <th className="px-2 py-1.5">Harga</th>
                      <th className="px-2 py-1.5">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr
                        key={order.id}
                        className="rounded-xl bg-slate-50 text-slate-800"
                      >
                        {/* ORDER ID */}
                        <td className="px-2 py-2 align-middle">
                          <div className="flex flex-col">
                            <span className="font-mono text-[10px]">
                              #{order.id.slice(0, 8)}
                            </span>
                            {order.notes && (
                              <span className="mt-0.5 line-clamp-1 text-[10px] text-slate-500">
                                {order.notes}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* PRODUCT */}
                        <td className="px-2 py-2 align-middle">
                          {order.product ? (
                            <div className="flex flex-col">
                              <Link
                                href={`/products/${order.product.slug}`}
                                className="text-[11px] font-medium text-slate-900 hover:underline"
                              >
                                {order.product.name}
                              </Link>
                              <span className="text-[10px] text-slate-500">
                                {order.product.currency}{" "}
                                {order.product.price}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-500">
                              (Produk tidak ditemukan)
                            </span>
                          )}
                        </td>

                        {/* DATE */}
                        <td className="px-2 py-2 align-middle">
                          <span className="text-[10px]">
                            {order.createdAt.toLocaleString()}
                          </span>
                        </td>

                        {/* PRICE (again, as total / highlight) */}
                        <td className="px-2 py-2 align-middle">
                          {order.product ? (
                            <span className="text-[11px] font-semibold">
                              {order.product.currency}{" "}
                              {order.product.price}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500">
                              -
                            </span>
                          )}
                        </td>

                        {/* STATUS */}
                        <td className="px-2 py-2 align-middle">
                          <span
                            className={[
                              "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold",
                              order.status === "PAID"
                                ? "bg-green-100 text-green-700"
                                : order.status === "PENDING"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-red-100 text-red-700",
                            ].join(" ")}
                          >
                            {formatStatus(order.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Back link */}
              <div className="mt-4 flex justify-end">
                <Link
                  href="/account"
                  className="text-[11px] text-slate-500 hover:text-slate-900 hover:underline"
                >
                  Kembali ke Account
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
