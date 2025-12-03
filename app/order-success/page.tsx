// app/order-success/page.tsx
import Link from "next/link";
import { getOrderById } from "../../lib/orders";
import { getProductBySlug, formatPrice } from "../../lib/products";

type OrderSuccessPageProps = {
  searchParams: Promise<{
    orderId?: string;
  }>;
};

export default async function OrderSuccessPage({
  searchParams,
}: OrderSuccessPageProps) {
  const { orderId } = await searchParams;

  if (!orderId) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto max-w-md px-4 py-12 text-center">
          <p className="text-sm font-semibold text-red-600">
            Order ID is missing
          </p>
          <p className="mt-2 text-xs text-slate-600">
            Tidak ada orderId di URL. Coba lakukan order ulang dari halaman
            produk.
          </p>
          <Link
            href="/products"
            className="mt-4 inline-flex rounded-full border border-slate-300 bg-white px-4 py-1.5 text-[11px] font-semibold text-slate-800 hover:bg-slate-50"
          >
            ← Back to products
          </Link>
        </div>
      </main>
    );
  }

  const order = await getOrderById(orderId);

  if (!order) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto max-w-md px-4 py-12 text-center">
          <p className="text-sm font-semibold text-red-600">
            Order not found
          </p>
          <p className="mt-2 text-xs text-slate-600">
            Order dengan ID{" "}
            <code className="font-mono text-[11px]">{orderId}</code> tidak
            ditemukan. Mungkin server sudah restart atau order belum pernah
            dibuat.
          </p>
          <Link
            href="/products"
            className="mt-4 inline-flex rounded-full border border-slate-300 bg-white px-4 py-1.5 text-[11px] font-semibold text-slate-800 hover:bg-slate-50"
          >
            ← Back to products
          </Link>
        </div>
      </main>
    );
  }

  const product = await getProductBySlug(order.productSlug);

  const isPending = order.status === "PENDING";
  const isPaid = order.status === "PAID";
  const isFailed = order.status === "FAILED";

  const amountLabel =
    product && product.currency === "IDR"
      ? formatPrice(product.price, product.currency)
      : product
      ? formatPrice(product.price, product.currency)
      : "-";

  const qrData = `DEMO-MONARX-PAYMENT-${order.id}`;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between gap-3">
          <Link
            href="/products"
            className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-800 hover:bg-slate-50"
          >
            ← Back to products
          </Link>
          <Link
            href="/"
            className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-800 hover:bg-slate-50"
          >
            Home
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-[minmax(0,3fr)_minmax(0,2.4fr)]">
          {/* LEFT: ringkasan order */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p
              className={
                "text-[11px] font-medium uppercase tracking-[0.25em] " +
                (isPending
                  ? "text-amber-500"
                  : isPaid
                  ? "text-emerald-500"
                  : "text-red-500")
              }
            >
              {isPending
                ? "ORDER CREATED"
                : isPaid
                ? "PAYMENT RECEIVED"
                : "PAYMENT ERROR"}
            </p>

            <h1 className="mt-2 text-lg font-semibold tracking-tight md:text-xl">
              {isPending && "Order pending payment"}
              {isPaid && "Payment confirmed"}
              {isFailed && "Payment failed"}
            </h1>

            {isPending && (
              <p className="mt-2 text-xs text-slate-600">
                Order kamu sudah tercatat dengan status{" "}
                <b className="font-semibold">PENDING</b>. Silakan lakukan
                pembayaran menggunakan QR di sebelah kanan. Setelah pembayaran
                terkonfirmasi, status akan berubah menjadi{" "}
                <b className="font-semibold">PAID</b>.
              </p>
            )}

            {isPaid && (
              <p className="mt-2 text-xs text-slate-600">
                Pembayaran untuk order ini{" "}
                <b className="font-semibold text-emerald-600">sudah diterima</b>.
                Akses / instruksi produk akan dikirim ke email berikut. Di versi
                production, di titik ini sistem seharusnya sudah mengirim email
                otomatis.
              </p>
            )}

            {isFailed && (
              <p className="mt-2 text-xs text-slate-600">
                Pembayaran untuk order ini berstatus{" "}
                <b className="font-semibold text-red-600">FAILED</b>. Silakan
                hubungi support atau buat order baru jika perlu.
              </p>
            )}

            <div className="mt-4 space-y-3 text-xs">
              <div className="rounded-2xl bg-slate-50 p-3 border border-slate-200">
                <p className="text-[11px] font-medium text-slate-500">
                  Order ID
                </p>
                <p className="text-xs font-semibold text-slate-900">
                  {order.id}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-3 border border-slate-200">
                <p className="text-[11px] font-medium text-slate-500">
                  Email
                </p>
                <p className="text-xs font-semibold text-slate-900">
                  {order.email}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-3 border border-slate-200">
                <p className="text-[11px] font-medium text-slate-500">
                  Product
                </p>
                {product ? (
                  <div className="mt-1 space-y-1">
                    <p className="text-xs font-semibold text-slate-900">
                      {product.name}
                    </p>
                    <p className="text-[11px] text-slate-600">
                      {formatPrice(product.price, product.currency)}
                    </p>
                  </div>
                ) : (
                  <p className="mt-1 text-[11px] text-slate-600">
                    (Produk tidak ditemukan di database mock.)
                  </p>
                )}
              </div>

              {order.notes && (
                <div className="rounded-2xl bg-slate-50 p-3 border border-slate-200">
                  <p className="text-[11px] font-medium text-slate-500">
                    Notes
                  </p>
                  <p className="mt-1 text-[11px] text-slate-700 whitespace-pre-line">
                    {order.notes}
                  </p>
                </div>
              )}

              {isPending && (
                <div className="rounded-2xl bg-amber-50 p-3 border border-amber-200">
                  <p className="text-[11px] font-medium text-amber-800">
                    Info
                  </p>
                  <p className="mt-1 text-[11px] text-amber-800/90">
                    Status akan tetap <b>PENDING</b> sampai payment gateway
                    mengirim callback, atau sampai kamu ubah manual menjadi{" "}
                    <b>PAID</b> dari halaman admin (demo).
                  </p>
                </div>
              )}

              {isPaid && (
                <div className="rounded-2xl bg-emerald-50 p-3 border border-emerald-200">
                  <p className="text-[11px] font-medium text-emerald-800">
                    Akses dikirim ke email (demo)
                  </p>
                  <p className="mt-1 text-[11px] text-emerald-800/90">
                    Di versi production, di tahap ini sistem akan:
                  </p>
                  <ul className="mt-1 list-inside list-disc text-[11px] text-emerald-800/90">
                    <li>Generate kode / akses AI</li>
                    <li>Mencatat delivery log</li>
                    <li>Mengirim email berisi detail order & panduan</li>
                  </ul>
                </div>
              )}

              {isFailed && (
                <div className="rounded-2xl bg-red-50 p-3 border border-red-200">
                  <p className="text-[11px] font-medium text-red-800">
                    Perlu bantuan?
                  </p>
                  <p className="mt-1 text-[11px] text-red-800/90">
                    Simpan Order ID ini dan hubungi support untuk cek status
                    pembayaran lebih lanjut.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-3 text-xs">
              <Link
                href="/products"
                className="rounded-full border border-slate-300 bg-white px-5 py-2 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Browse more products
              </Link>
              <button className="rounded-full bg-slate-900 px-5 py-2 font-semibold text-white hover:bg-black">
                Contact support (placeholder)
              </button>
            </div>
          </div>

          {/* RIGHT: payment box */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-slate-500">
              PAYMENT
            </p>

            {isPending && (
              <>
                <h2 className="mt-2 text-sm font-semibold text-slate-900">
                  Scan QR & pay (demo)
                </h2>
                <p className="mt-1 text-[11px] text-slate-600">
                  Di versi production, box ini akan menampilkan QR dari payment
                  gateway (Alipay, WeChat, USDT, dll). Sekarang hanya ilustrasi.
                </p>

                <div className="mt-4 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5">
                  <div className="rounded-2xl bg-white p-3 shadow-sm">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=170x170&data=${encodeURIComponent(
                        qrData
                      )}`}
                      alt="Fake payment QR"
                      className="h-[170px] w-[170px] object-contain"
                    />
                  </div>
                  <p className="text-[11px] text-slate-600 text-center">
                    QR ini hanya contoh. Data di dalamnya:{" "}
                    <code className="font-mono text-[10px]">{qrData}</code>
                  </p>
                </div>

                <div className="mt-4 rounded-2xl bg-slate-50 p-3 border border-slate-200 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Amount</span>
                    <span className="text-sm font-semibold text-slate-900">
                      {amountLabel}
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] text-slate-600">
                    Setelah pembayaran sukses, gateway akan memanggil endpoint
                    callback dan mengubah status order menjadi{" "}
                    <span className="font-semibold">PAID</span>.
                  </p>
                </div>
              </>
            )}

            {isPaid && (
              <>
                <h2 className="mt-2 text-sm font-semibold text-slate-900">
                  Payment status: PAID
                </h2>
                <p className="mt-1 text-[11px] text-slate-600">
                  Pembayaran sudah dikonfirmasi. QR payment tidak lagi
                  ditampilkan karena order ini sudah lunas.
                </p>

                <div className="mt-4 rounded-2xl bg-emerald-50 p-4 border border-emerald-200 text-[11px]">
                  <p className="font-semibold text-emerald-800">
                    Terima kasih!
                  </p>
                  <p className="mt-1 text-emerald-800/90">
                    Di implementasi nyata, di bagian kanan ini bisa ditampilkan:
                  </p>
                  <ul className="mt-1 list-inside list-disc text-emerald-800/90">
                    <li>Ringkasan pembayaran (metode, waktu, amount)</li>
                    <li>Link ke riwayat order / invoice PDF</li>
                    <li>Shortcut ke halaman bantuan jika ada masalah akses</li>
                  </ul>
                </div>
              </>
            )}

            {isFailed && (
              <>
                <h2 className="mt-2 text-sm font-semibold text-slate-900">
                  Payment status: FAILED
                </h2>
                <p className="mt-1 text-[11px] text-slate-600">
                  Sistem mendeteksi bahwa pembayaran gagal atau dibatalkan.
                  QR baru bisa diterbitkan dengan membuat order baru atau
                  mengulang flow pembayaran.
                </p>

                <div className="mt-4 rounded-2xl bg-red-50 p-4 border border-red-200 text-[11px]">
                  <p className="font-semibold text-red-800">Catatan:</p>
                  <p className="mt-1 text-red-800/90">
                    Di versi production, status ini biasanya diterima dari
                    payment gateway ketika transaksi kadaluarsa, gagal, atau
                    ditolak bank.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
