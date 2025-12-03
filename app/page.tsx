// app/page.tsx
import Link from "next/link";
import { getFeaturedProducts, formatPrice } from "../lib/products";

export default async function Home() {
  const featuredProducts = await getFeaturedProducts(6);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* TOP STRIP */}
      <div className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2 text-xs text-slate-500">
          <nav className="flex gap-4">
            <Link href="#" className="hover:text-slate-800">
              For buyers
            </Link>
            <Link href="#" className="hover:text-slate-800">
              For partners
            </Link>
            <Link href="#" className="hover:text-slate-800">
              FAQ
            </Link>
            <Link href="#" className="hover:text-slate-800">
              Support
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-[11px] hover:border-slate-300 hover:text-slate-700">
              <span>RMB • ¥</span>
            </button>
            <button className="flex items-center gap-2 rounded-full bg-white px-2.5 py-1 text-[11px] shadow-sm hover:bg-slate-50">
              <span className="inline-block h-3.5 w-3.5 rounded-full bg-red-500" />
              <span>English</span>
            </button>
          </div>
        </div>
      </div>

      {/* MAIN HEADER */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-600 text-[11px] font-bold text-white">
              AI
            </div>
            <span className="text-lg font-semibold tracking-tight">
              Monarx AI Store
            </span>
          </Link>

          {/* Catalog button */}
          <Link
            href="/products"
            className="hidden items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 md:flex"
          >
            <span className="inline-block h-3 w-3 rounded-[3px] border border-red-200" />
            AI Catalog
          </Link>

          {/* Search bar (belum nyambung ke DB, nanti bisa ditambah) */}
          <form className="flex-1">
            <div className="flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm shadow-sm focus-within:border-red-500">
              <input
                type="text"
                placeholder="Search AI products (ChatGPT, Claude, Gemini...)"
                className="flex-1 bg-transparent text-xs text-slate-900 outline-none placeholder:text-slate-400"
              />
              <button
                type="submit"
                className="rounded-full bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-500"
              >
                Search
              </button>
            </div>
          </form>

          {/* Auth */}
          <div className="hidden items-center gap-2 md:flex">
            <button className="rounded-full border border-slate-200 px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
              Sign in
            </button>
            <button className="rounded-full bg-slate-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-black">
              Sign up
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-6 md:pt-8">
          <div className="grid gap-6 md:grid-cols-[minmax(0,3fr)_minmax(0,2.3fr)]">
            {/* Left hero card */}
            <div className="rounded-3xl bg-white px-6 py-8 shadow-sm md:px-8 md:py-10">
              <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-red-500">
                AI DIGITAL STORE
              </p>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
                Your reliable marketplace
                <span className="block text-slate-700">
                  for digital goods and services.
                </span>
              </h1>
              <p className="mt-4 text-xs leading-relaxed text-slate-600 md:text-sm">
                ChatGPT, Claude, Gemini, Midjourney, Perplexity and more —
                everything in one place.
              </p>
              <div className="mt-5 flex flex-wrap gap-3 text-xs">
                <Link
                  href="/products"
                  className="rounded-full bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-500"
                >
                  Explore AI products
                </Link>
                <button className="rounded-full border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50">
                  Contact support
                </button>
              </div>
              <p className="mt-3 text-[11px] text-slate-500">
                * Semua nama dan harga masih contoh. Nanti bisa diganti dengan
                data asli dari panel / database kamu.
              </p>
            </div>

            {/* Right hero illustration – sederhana */}
            <div className="flex items-stretch justify-center">
              <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold text-slate-800">
                  Example AI bundle
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  This box is just a static illustration to show that we sell AI
                  products only.
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  {["ChatGPT", "Claude", "Gemini", "Midjourney"].map((name) => (
                    <div
                      key={name}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500 text-[10px] font-semibold text-white">
                        {name[0]}
                      </div>
                      <p className="mt-2 text-[11px] font-medium text-slate-800">
                        {name}
                      </p>
                      <div className="mt-2 h-1 w-16 rounded-full bg-slate-300" />
                      <div className="mt-1 h-1 w-10 rounded-full bg-slate-200" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY MONARX AI */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 pb-8">
          <div className="rounded-3xl bg-white px-5 py-6 shadow-sm md:px-7 md:py-7">
            <h2 className="text-sm font-semibold text-slate-900 md:text-base">
              Why choose Monarx AI Store?
            </h2>
            <p className="mt-1 text-xs text-slate-600">
              Bukan general marketplace. Semua fokus ke AI, jadi penjelasan
              ke klien lebih gampang.
            </p>

            <div className="mt-5 grid gap-4 md:grid-cols-4">
              {[
                {
                  title: "Auto-delivery",
                  body: "Products are delivered instantly right after payment — fully automated, no waiting.",
                },
                {
                  title: "Secure & trusted platform",
                  body: "Encrypted transactions and verified suppliers ensure your purchases are safe and reliable.",
                },
                {
                  title: "Merchant auto-redeem",
                  body: "Direct integration with merchant channels ensures fast, secure, real-time redemption.",
                },
                {
                  title: "Auto top-up & renewal",
                  body: "Your subscriptions stay active automatically with seamless top-up and renewal support.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-xl bg-red-50">
                    <span className="h-4 w-4 rounded-md border border-red-400" />
                  </div>
                  <p className="text-xs font-semibold text-slate-900">
                    {item.title}
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* AI PRODUCT GRID – FEATURED FROM DB */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 pb-10">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 md:text-base">
                Featured AI products
              </h2>
              <p className="mt-1 text-xs text-slate-600">
                Produk unggulan yang muncul di landing page. Data diambil dari
                database.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden rounded-full bg-red-50 px-3 py-1 text-[11px] text-red-600 md:inline">
                Fokus AI · Tidak ada games / barang lain
              </span>
              <Link
                href="/products"
                className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-800 hover:bg-slate-50"
              >
                View all products
              </Link>
            </div>
          </div>

          {featuredProducts.length === 0 ? (
            <p className="text-xs text-slate-500">
              Belum ada produk yang ditandai sebagai featured.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {featuredProducts.map((p) => (
                <Link
                  href={`/products/${p.slug}`}
                  key={p.id}
                  className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-red-300"
                >
                  {/* IMAGE: rasio fix & zoom */}
                  <div className="mb-3 overflow-hidden rounded-xl bg-slate-100">
                    <div className="relative w-full aspect-[16/9]">
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    </div>
                  </div>

                  {/* WRAPPER KONTEN – flex-1 supaya tombol nempel bawah */}
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold text-slate-900">
                          {p.name}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-500 line-clamp-2">
                          {p.description}
                        </p>
                      </div>
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-500 text-[10px] font-bold text-white">
                        AI
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Price</span>
                      <span className="text-sm font-semibold text-red-600">
                        {formatPrice(p.price, p.currency)}
                      </span>
                    </div>

                    <div className="mt-1 text-[11px] text-slate-500">
                      Stock:{" "}
                      <span className={p.stock > 0 ? "" : "text-red-500"}>
                        {p.stock > 0 ? p.stock : "Out of stock"}
                      </span>
                    </div>
                  </div>

                  {/* BUTTON – selalu di bawah */}
                  <span className="mt-3 inline-flex justify-center rounded-full bg-red-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-red-500">
                    View details
                  </span>
                </Link>
              ))}

            </div>
          )}
        </div>
      </section>

      {/* HOW TO BUY */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 pb-10">
          <div className="grid gap-6 md:grid-cols-[minmax(0,3fr)_minmax(0,2.2fr)]">
            <div className="rounded-3xl bg-white px-5 py-6 shadow-sm md:px-7 md:py-7">
              <h2 className="text-sm font-semibold text-slate-900 md:text-base">
                How to buy (concept)
              </h2>
              <p className="mt-1 text-xs text-slate-600">
                Flow ini bisa kamu tunjukkan ke klien sebagai gambaran alur
                pembelian.
              </p>

              <div className="mt-5 space-y-3 text-xs">
                {[
                  {
                    title: "1. Choose AI product",
                    desc: "Pilih ChatGPT, Claude, Gemini, Midjourney, atau paket lain dari katalog.",
                  },
                  {
                    title: "2. Pay via Alipay / WeChat / USDT",
                    desc: "Metode pembayaran nanti disesuaikan dengan payment gateway yang disetup partnermu.",
                  },
                  {
                    title: "3. Receive access",
                    desc: "Produk otomatis akan dikirim, atau kami pandu secara manual jika perlu langkah tambahan.",
                  },
                ].map((step) => (
                  <div
                    key={step.title}
                    className="rounded-2xl bg-slate-50 p-3 border border-slate-200"
                  >
                    <p className="text-xs font-semibold text-slate-900">
                      {step.title}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-600">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right box simple */}
            <div className="flex items-center justify-center">
              <div className="w-full max-w-xs rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold text-slate-900">
                  Checkout example
                </p>
                <p className="mt-1 text-[11px] text-slate-600">
                  Box ini hanya contoh tampilan ketika user memilih beberapa
                  produk AI.
                </p>
                <div className="mt-3 space-y-2 text-[11px]">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-xl bg-slate-50 p-2 border border-slate-200"
                    >
                      <span className="text-slate-800">
                        {i === 0
                          ? "ChatGPT Plus"
                          : i === 1
                          ? "Claude Pro"
                          : "Gemini Advanced"}
                      </span>
                      <span className="font-semibold text-red-600">
                        {i === 0 ? "$20" : "$25"}
                      </span>
                    </div>
                  ))}
                </div>
                <button className="mt-3 w-full rounded-full bg-red-600 py-1.5 text-[11px] font-semibold text-white hover:bg-red-500">
                  Pay now (example)
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white pb-8 pt-6 text-[11px] text-slate-500">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-6 md:grid-cols-4">
            <div>
              <p className="text-xs font-semibold text-slate-900">
                Monarx AI Store
              </p>
              <p className="mt-2 max-w-xs text-[11px] text-slate-600">
                Simple, clean landing page for AI subscriptions and credits.
                Dirancang supaya mudah dimengerti partner dan buyer.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900">
                For buyers
              </p>
              <ul className="mt-2 space-y-1">
                <li>FAQ</li>
                <li>How to order</li>
                <li>Refund rules</li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900">
                For partners
              </p>
              <ul className="mt-2 space-y-1">
                <li>Reseller program</li>
                <li>Bulk orders</li>
                <li>API access</li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900">
                Legal & docs
              </p>
              <ul className="mt-2 space-y-1">
                <li>User agreement</li>
                <li>Privacy policy</li>
                <li>Terms of service</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
            <span className="text-xs text-slate-500">
              © {new Date().getFullYear()}, Monarx AI Store
            </span>
            <div className="flex gap-3 text-slate-400">
              {["TG", "DC", "WX", "X", "IG"].map((x) => (
                <span
                  key={x}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[10px]"
                >
                  {x}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
