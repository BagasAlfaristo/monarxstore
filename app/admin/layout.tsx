// app/admin/layout.tsx
import type { ReactNode } from "react";
import Link from "next/link";
import "../globals.css";

export const metadata = {
  title: "Admin Panel - Monarx Store",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* TOP NAVBAR ADMIN (sticky) */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          {/* Left: brand / title */}
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Monarx
            </span>
            <span className="text-xs font-medium text-slate-700">
              Admin Panel
            </span>
          </div>

          {/* Right: nav links */}
          <nav className="flex flex-wrap items-center gap-3 text-xs font-medium">
            <Link
              href="/admin"
              className="text-slate-700 hover:text-slate-900"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/products"
              className="text-slate-700 hover:text-slate-900"
            >
              Products
            </Link>
            <Link
              href="/admin/items"
              className="text-slate-700 hover:text-slate-900"
            >
              Product Items
            </Link>
            <Link
              href="/admin/orders"
              className="text-slate-700 hover:text-slate-900"
            >
              Orders
            </Link>
            <Link
              href="/"
              className="text-slate-700 hover:text-slate-900"
            >
              Back to Store
            </Link>
          </nav>
        </div>
      </header>

      {/* CONTENT */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
