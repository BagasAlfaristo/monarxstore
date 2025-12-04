//home/zyan/Coding/monarxstore/monarxstore/app/account/page.tsxexport const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";

export default async function AccountPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login?from=/account");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: currentUser.id },
    select: {
      id: true,
      email: true,
      name: true,
      isAdmin: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!dbUser) {
    redirect("/login");
  }

  const displayName = dbUser.name || dbUser.email;

  // Nanti bisa di-hook ke tabel orders sungguhan
  const orders = await prisma.order.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      createdAt: true,
      product: {
        select: {
          name: true,
          price: true,
          currency: true,
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

          <div className="flex items-center gap-3">
            <Link
              href="/products"
              className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              AI Catalog
            </Link>

            <form method="POST" action="/api/auth/logout">
              <button
                type="submit"
                className="rounded-full bg-slate-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-black"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* BODY */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
          {/* TITLE + MINI NAV */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-base font-semibold text-slate-900">
                Account
              </h1>
              <p className="text-[11px] text-slate-500">
                Kelola data akun dan lihat riwayat pembelianmu.
              </p>
            </div>

            {dbUser.isAdmin && (
              <Link
                href="/admin/orders"
                className="rounded-full border border-slate-200 px-3 py-1.5 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
              >
                Admin panel
              </Link>
            )}
          </div>

          {/* GRID: overview + edit */}
          <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,2fr)]">
            {/* Info dasar */}
            <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-200">
              <p className="text-xs font-semibold text-slate-900">
                Profile overview
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                Data login untuk Monarx AI Store.
              </p>

              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-slate-900">
                    {displayName}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {dbUser.email}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Role:{" "}
                    <span className="font-medium">
                      {dbUser.isAdmin ? "Admin" : "Customer"}
                    </span>
                  </p>
                </div>
              </div>

              <div className="mt-4 text-[11px] text-slate-500 space-y-1">
                <p>
                  Joined:{" "}
                  <span className="font-medium">
                    {dbUser.createdAt.toLocaleString()}
                  </span>
                </p>
                <p>
                  Last updated:{" "}
                  <span className="font-medium">
                    {dbUser.updatedAt.toLocaleString()}
                  </span>
                </p>
              </div>
            </div>

            {/* Form ubah display name */}
            <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-200">
              <p className="text-xs font-semibold text-slate-900">
                Edit profile
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                Ubah nama tampilan (tidak mengubah email).
              </p>

              <form
                method="POST"
                action="/api/profile"
                className="mt-4 space-y-3 text-[11px]"
              >
                <div className="space-y-1">
                  <label
                    htmlFor="name"
                    className="block text-[11px] font-medium text-slate-700"
                  >
                    Display name
                  </label>
                  <input
                    id="name"
                    name="name"
                    defaultValue={dbUser.name ?? ""}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    placeholder="Your name / brand"
                  />
                  <p className="text-[10px] text-slate-400">
                    Kalau dikosongkan, sistem akan tetap menampilkan email.
                  </p>
                </div>

                <button
                  type="submit"
                  className="mt-2 w-full rounded-full bg-red-600 py-2 text-[11px] font-semibold text-white hover:bg-red-500"
                >
                  Save changes
                </button>
              </form>

              <p className="mt-3 text-[10px] text-slate-400">
                (Form ganti password bisa kita tambahkan nanti.)
              </p>
            </div>
          </div>

          {/* ORDER HISTORY SECTION */}
          <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold text-slate-900">
                  Order history
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Daftar transaksi yang pernah kamu lakukan.
                </p>
              </div>
              {/* Nanti bisa jadi filter / link ke page khusus */}
            </div>

            {orders.length === 0 ? (
              <p className="mt-4 text-[11px] text-slate-500">
                Kamu belum punya order. Coba jelajahi{" "}
                <Link
                  href="/products"
                  className="font-medium text-red-600 hover:underline"
                >
                  katalog AI
                </Link>
                .
              </p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-1 text-[11px]">
                  <thead>
                    <tr className="text-left text-slate-500">
                      <th className="px-2 py-1.5">Order ID</th>
                      <th className="px-2 py-1.5">Tanggal</th>
                      <th className="px-2 py-1.5">Total</th>
                      <th className="px-2 py-1.5">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr
                        key={order.id}
                        className="rounded-lg bg-slate-50 text-slate-800"
                      >
                        <td className="px-2 py-1.5 align-middle">
                          <span className="font-mono text-[10px]">
                            #{order.id.slice(0, 8)}
                          </span>
                        </td>

                        <td className="px-2 py-1.5 align-middle">
                          {order.createdAt.toLocaleString()}
                        </td>

                        <td className="px-2 py-1.5 align-middle">
                          <div className="flex flex-col">
                            <span className="text-[11px] font-medium">
                              {order.product.name}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {order.product.currency} {order.product.price}
                            </span>
                          </div>
                        </td>

                        <td className="px-2 py-1.5 align-middle">
                          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold">
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
