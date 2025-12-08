// app/admin/layout.tsx
import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import "../globals.css";

export const metadata = {
  title: "Admin Panel - Monarx Store",
};

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  // ⬇️ cek user dari cookie
  const user = await getCurrentUser();

  // kalau belum login atau bukan admin → lempar ke login
  if (!user || !user.isAdmin) {
    redirect("/login?from=/admin");
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* TOP NAVBAR ADMIN (sticky) */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          {/* Left: brand / title */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-[11px] font-bold text-white">
              ADM
            </div>
            <div>
              <p className="text-sm font-semibold">Monarx Admin</p>
              <p className="text-[11px] text-slate-500">
                Logged in as {user.email}
              </p>
            </div>
          </div>

          {/* Right: simple nav */}
          <nav className="flex items-center gap-2 text-[11px]">
            <Link
              href="/admin/products"
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 hover:bg-slate-50"
            >
              Products
            </Link>
            <Link
              href="/admin/items"
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 hover:bg-slate-50"
            >
              Product Items
            </Link>
            <Link
              href="/admin/orders"
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 hover:bg-slate-50"
            >
              Orders
            </Link>
            <Link
              href="/"
              className="rounded-full bg-slate-900 px-3 py-1.5 text-white hover:bg-black"
            >
              Back to Store
            </Link>
          </nav>
        </div>
      </header>

      {/* CONTENT */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
