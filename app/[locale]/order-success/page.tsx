// app/[locale]/order-success/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import {
  AUTH_COOKIE_NAME,
  verifyAuthToken,
  type AuthTokenPayload,
} from "@/lib/auth";
import type { Locale } from "@/i18n";
import { PaymentQrDemo } from "@/components/PaymentQrDemo";

type UiCurrency = "USD" | "CNY";
type UiLanguage = "en" | "zh";

interface OrderSuccessPageProps {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{
    id?: string;
    currency?: string;
  }>;
}

// helper: format harga ke UI currency
function formatPriceForUi(
  price: number,
  baseCurrency: string,
  uiCurrency: UiCurrency
): string {
  const usdFmt = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  const cnyFmt = new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
  });

  const RATE_IDR_TO_USD = 1 / 15500;
  const RATE_IDR_TO_CNY = 1 / 2200;
  const RATE_USD_TO_CNY = 7.1;

  if (baseCurrency === "IDR") {
    if (uiCurrency === "USD") {
      const usd = price * RATE_IDR_TO_USD;
      return usdFmt.format(usd);
    }
    const cny = price * RATE_IDR_TO_CNY;
    return cnyFmt.format(cny);
  }

  if (baseCurrency === "USD") {
    if (uiCurrency === "USD") return usdFmt.format(price);
    const cny = price * RATE_USD_TO_CNY;
    return cnyFmt.format(cny);
  }

  if (baseCurrency === "CNY") {
    if (uiCurrency === "CNY") return cnyFmt.format(price);
    const usd = price / RATE_USD_TO_CNY;
    return usdFmt.format(usd);
  }

  return `${price} ${baseCurrency}`;
}

const dict = {
  en: {
    title: "Order created",
    subtitle:
      "We’ve created your order with status pending. You can complete payment based on your own flow.",
    statusLabel: "Status",
    statusPending: "Pending",
    statusPaid: "Paid",
    statusFailed: "Failed",
    productLabel: "Product",
    priceLabel: "Price",
    emailLabel: "Order email",
    notesLabel: "Notes",
    notesEmpty: "No additional notes.",
    createdAtLabel: "Created at",
    backToAccount: "Go to my account",
    backToProducts: "Back to products",
    backToHome: "Back to homepage",
    paymentMethodLabel: "Payment method",
  },
  zh: {
    title: "订单已创建",
    subtitle:
      "订单状态当前为待付款，你可以根据自己的支付流程完成后续操作。",
    statusLabel: "订单状态",
    statusPending: "待付款",
    statusPaid: "已付款",
    statusFailed: "失败",
    productLabel: "商品",
    priceLabel: "价格",
    emailLabel: "下单邮箱",
    notesLabel: "备注",
    notesEmpty: "没有填写备注。",
    createdAtLabel: "创建时间",
    backToAccount: "进入个人中心",
    backToProducts: "返回商品列表",
    backToHome: "返回首页",
    paymentMethodLabel: "支付方式",
  },
} as const;

export default async function OrderSuccessPage({
  params,
  searchParams,
}: OrderSuccessPageProps) {
  const { locale } = await params;
  const qs = await searchParams;

  const uiCurrency: UiCurrency = qs?.currency === "CNY" ? "CNY" : "USD";
  const uiLanguage: UiLanguage = locale === "zh" ? "zh" : "en";
  const t = dict[uiLanguage];

  const orderId = (qs?.id ?? "").toString();

  if (!orderId) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center text-sm">
          <p className="text-base font-semibold text-slate-900">
            Order not found
          </p>
          <p className="mt-2 text-xs text-slate-600">
            The order ID is missing. Please go back to the homepage and try
            again.
          </p>
          <div className="mt-4 inline-flex gap-2">
            <Link
              href={`/${locale}`}
              className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-black"
            >
              {t.backToHome}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // cookies() itu synchronous, nggak perlu await
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  let currentUser: AuthTokenPayload | null = null;
  if (token) {
    try {
      currentUser = await verifyAuthToken(token);
    } catch {
      currentUser = null;
    }
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      product: true,
      items: true,
    },
  });

  // pastikan order & product ada SEBELUM dipakai di bawah
  if (!order || !order.product) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center text-sm">
          <p className="text-base font-semibold text-slate-900">
            Order not found
          </p>
          <p className="mt-2 text-xs text-slate-600">
            We couldn&apos;t find this order. It may have been removed.
          </p>
          <div className="mt-4 inline-flex gap-2">
            <Link
              href={`/${locale}/products`}
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
            >
              {t.backToProducts}
            </Link>
            <Link
              href={`/${locale}`}
              className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-black"
            >
              {t.backToHome}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const orderAny = order as any;

  const canViewItems =
    order.status === "PAID" &&
    currentUser &&
    order.email === currentUser.email;

  const items = canViewItems ? order.items : [];

  const priceLabel = formatPriceForUi(
    order.product.price,
    order.product.currency,
    uiCurrency
  );

  const statusBadge =
    order.status === "PAID"
      ? t.statusPaid
      : order.status === "FAILED"
        ? t.statusFailed
        : t.statusPending;

  const statusColorClass =
    order.status === "PAID"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : order.status === "FAILED"
        ? "bg-red-50 text-red-700 border-red-200"
        : "bg-amber-50 text-amber-700 border-amber-200";

  // asumsikan amount & currency snapshot di order (USD sebagai base)
  const amountUsd =
    orderAny.currency === "USD" ? orderAny.amount : orderAny.amount;

  const methodLabel =
    orderAny.paymentMethod === "ALIPAY"
      ? "Alipay"
      : orderAny.paymentMethod === "WECHAT"
        ? "WeChat Pay"
        : orderAny.paymentMethod === "MANUAL"
          ? "Manual"
          : uiLanguage === "en"
            ? "Not set (demo)"
            : "未设置（示例）";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-3xl px-4 pb-12 pt-10">
        <div className="mb-6">
          <h1 className="text-lg font-semibold text-slate-900 md:text-xl">
            {t.title}
          </h1>
          <p className="mt-1 text-xs text-slate-600">{t.subtitle}</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-medium text-slate-500">
                {t.statusLabel}
              </p>
              <p
                className={`mt-1 inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold ${statusColorClass}`}
              >
                {statusBadge}
              </p>
            </div>
            <div className="text-right text-[11px] text-slate-500">
              <p>{t.createdAtLabel}</p>
              <p className="mt-1 text-xs text-slate-800">
                {order.createdAt.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="space-y-2 text-[11px]">
              <p className="font-semibold text-slate-900">{t.productLabel}</p>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-xs font-semibold text-slate-900">
                  {order.product.name}
                </p>
                <p className="mt-1 line-clamp-2 text-[11px] text-slate-600">
                  {order.product.description}
                </p>
              </div>

              <p className="mt-3 font-semibold text-slate-900">
                {t.priceLabel}
              </p>
              <p className="text-sm font-semibold text-red-600">
                {priceLabel}
              </p>

              <p className="mt-3 font-semibold text-slate-900">
                {t.paymentMethodLabel}
              </p>
              <p className="rounded-2xl bg-slate-50 px-3 py-2 text-xs text-slate-800">
                {methodLabel}
              </p>
            </div>

            <div className="space-y-2 text-[11px]">
              <p className="font-semibold text-slate-900">{t.emailLabel}</p>
              <p className="rounded-2xl bg-slate-50 px-3 py-2 text-xs text-slate-800">
                {order.email}
              </p>

              <p className="mt-3 font-semibold text-slate-900">
                {t.notesLabel}
              </p>
              <p className="rounded-2xl bg-slate-50 px-3 py-2 text-xs text-slate-700">
                {order.notes || t.notesEmpty}
              </p>
            </div>
          </div>

          {/* Detail akun / kode yang dibeli */}
          {order.status === "PAID" && (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-[11px]">
              {canViewItems ? (
                <>
                  <p className="mb-2 font-semibold text-slate-900">
                    Detail akun / kode yang kamu beli
                  </p>

                  {items.length === 0 ? (
                    <p className="text-[11px] text-slate-500">
                      Order sudah PAID, tapi belum ada item yang ter-assign.
                      Kalau ini terjadi terus, hubungi admin.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-xl bg-white px-3 py-2 text-xs text-slate-800"
                        >
                          <p className="text-[10px] uppercase tracking-wide text-slate-500">
                            {item.type}
                          </p>
                          <p className="mt-1 font-mono text-[11px] break-all">
                            {item.value}
                          </p>
                          {item.note && (
                            <p className="mt-1 text-[10px] text-slate-500">
                              {item.note}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="mt-3 text-[10px] text-slate-500">
                    Simpan baik-baik data di atas. Kalau akun / kode bermasalah,
                    kamu bisa hubungi admin atau balas email konfirmasi.
                  </p>
                </>
              ) : (
                <p className="text-[11px] text-slate-500">
                  Detail akun / kode hanya bisa dilihat setelah kamu login ke
                  akun yang sama dengan email pemesanan.
                </p>
              )}
            </div>
          )}

          {/* Payment QR demo – pakai data dari DB */}
          <PaymentQrDemo
            orderId={order.id}
            amountUsd={amountUsd}
            paymentMethod={orderAny.paymentMethod}
          />

          <div className="mt-6 flex flex-wrap gap-3">
            {currentUser && (
              <Link
                href={`/${locale}/account`}
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-black"
              >
                {t.backToAccount}
              </Link>
            )}
            <Link
              href={`/${locale}/products`}
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
            >
              {t.backToProducts}
            </Link>
            <Link
              href={`/${locale}`}
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
            >
              {t.backToHome}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
