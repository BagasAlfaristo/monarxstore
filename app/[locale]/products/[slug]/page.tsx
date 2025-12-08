// app/[locale]/products/[slug]/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getFeaturedProducts } from "@/lib/products";

import { getProductBySlug } from "@/lib/products";
import { countAvailableItemsByProduct } from "@/lib/productItems";
import {
  AUTH_COOKIE_NAME,
  verifyAuthToken,
  type AuthTokenPayload,
} from "@/lib/auth";
import type { Locale } from "@/i18n";

type UiCurrency = "USD" | "CNY";
type UiLanguage = "en" | "zh";

type ProductPageProps = {
  params: Promise<{
    locale: Locale;
    slug: string;
  }>;
  searchParams: Promise<{
    currency?: string;
  }>;
};

type MakeUrlOverrides = {
  currency?: UiCurrency;
  locale?: Locale;
  section?: "home" | "products" | "detail";
  q?: string;
};

// helper: format harga dari base USD ke UI currency
function formatPriceForUi(priceInUsd: number, uiCurrency: UiCurrency): string {
  const usdFmt = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });

  const cnyFmt = new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    maximumFractionDigits: 2,
  });

  // rate kasar, nanti bisa kamu pindah ke config / env
  const RATE_USD_TO_CNY = 7.1; // ± 1 USD = 7.1 CNY

  if (uiCurrency === "USD") {
    return usdFmt.format(priceInUsd);
  }

  // UI CNY
  const cny = priceInUsd * RATE_USD_TO_CNY;
  return cnyFmt.format(cny);
}

// text dictionary khusus page detail + header
const dict = {
  en: {
    // header
    searchPlaceholder: "Search AI products",
    navSignIn: "Sign in",
    navSignUp: "Sign up",
    navProfile: "Profile",
    navOrderHistory: "Order history",
    navOrderHistorySoon: "Soon",
    navAdminPanel: "Admin panel",
    navSignedInAs: "Signed in as",
    navSignOut: "Sign out",

    // page
    backToProducts: "← Back to all products",
    backToHome: "← Back to homepage",
    productBadge: "AI PRODUCT",
    priceLabel: "Price",
    stockLabel: "Stock",
    stockOut: "Out of stock",
    stockAvailableSuffix: "available",
    descriptionTitle: "Product description",
    descriptionHint:
      "Text below is loaded from the database. You can change it from the admin panel.",
    checkoutTitle: "Checkout",
    checkoutSubtitleLoggedIn:
      "We’ll deliver access to your account email ({email}).",
    checkoutSubtitleGuest:
      "Enter the email that should receive access and the next instructions.",
    emailLabel: "Email",
    notesLabel: "Notes (optional)",
    notesPlaceholder:
      "Example: Please send usage guide in Chinese, special notes, etc.",
    placeOrder: "Place order",
    outOfStockButton: "Out of stock",
    checkoutInfoNote:
      "After this, you will be redirected to an order summary page (status: pending). Payment integration and auto-delivery can be added later.",

    // NEW: payment method
    paymentMethodTitle: "Payment method",
    paymentMethodHelp:
      "Choose where you want to pay. The final QR / payment link will follow this choice.",
    paymentMethodAlipay: "Alipay",
    paymentMethodWeChat: "WeChat Pay",
    paymentMethodManual: "Manual / bank transfer (demo)",
  },
  zh: {
    // header
    searchPlaceholder: "搜索 AI 商品",
    navSignIn: "登录",
    navSignUp: "注册",
    navProfile: "个人中心",
    navOrderHistory: "订单记录",
    navOrderHistorySoon: "即将上线",
    navAdminPanel: "管理后台",
    navSignedInAs: "当前登录帐号",
    navSignOut: "退出登录",

    // page
    backToProducts: "← 返回全部商品",
    backToHome: "← 返回首页",
    productBadge: "AI 商品",
    priceLabel: "价格",
    stockLabel: "库存",
    stockOut: "暂时售罄",
    stockAvailableSuffix: "个可用",
    descriptionTitle: "商品介绍",
    descriptionHint: "下面的文字来自数据库，你可以在管理后台随时修改。",
    checkoutTitle: "结算",
    checkoutSubtitleLoggedIn:
      "我们会将访问权限发送到你的帐号邮箱（{email}）。",
    checkoutSubtitleGuest: "请输入接收账号/说明的邮箱地址。",
    emailLabel: "邮箱",
    notesLabel: "备注（可选）",
    notesPlaceholder: "例如：请发送中文使用说明，或其它特别要求。",
    placeOrder: "提交订单",
    outOfStockButton: "暂时售罄",
    checkoutInfoNote:
      "提交后会跳转到订单详情页（状态：待付款）。支付渠道与自动发货可以后续接入。",

    // NEW: payment method
    paymentMethodTitle: "支付方式",
    paymentMethodHelp: "先选择支付方式，生成的二维码会根据这里的设置来。",
    paymentMethodAlipay: "支付宝",
    paymentMethodWeChat: "微信支付",
    paymentMethodManual: "手动 / 银行转账（示例）",
  },
} as const;

export default async function ProductDetailPage({
  params,
  searchParams,
}: ProductPageProps) {
  const { locale, slug } = await params;
  const qs = await searchParams;

  const uiCurrency: UiCurrency = qs?.currency === "CNY" ? "CNY" : "USD";
  const uiLanguage: UiLanguage = locale === "zh" ? "zh" : "en";
  const t = dict[uiLanguage];

  // URL helper → sama pola dengan /products
  const makeUrl = (overrides: MakeUrlOverrides = {}) => {
    const targetLocale = overrides.locale ?? locale;
    const targetCurrency = overrides.currency ?? uiCurrency;
    const section = overrides.section ?? "detail";
    const q = (overrides.q ?? "").trim();

    const basePath =
      section === "home"
        ? `/${targetLocale}`
        : section === "products"
          ? `/${targetLocale}/products`
          : `/${targetLocale}/products/${slug}`;

    const sp = new URLSearchParams();
    if (targetCurrency) sp.set("currency", targetCurrency);
    if (q) sp.set("q", q);

    const query = sp.toString();
    return query ? `${basePath}?${query}` : basePath;
  };

  const currencyLabel = uiCurrency === "USD" ? "USD • $" : "CNY • ¥";

  // product
  const product = await getProductBySlug(slug);
  if (!product) return notFound();

  const productRedirectPath = `/${locale}/products/${product.slug}?currency=${uiCurrency}`;
  const availableItemCount = await countAvailableItemsByProduct(product.id);
  const isOutOfStock = availableItemCount <= 0;

  // auth user
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
  const isLoggedIn = !!currentUser;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* HEADER – sama dengan /products */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          {/* Logo + brand */}
          <Link
            href={makeUrl({ section: "home" })}
            className="flex items-center gap-2"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-600 text-[11px] font-bold text-white">
              AI
            </div>
            <span className="text-lg font-semibold tracking-tight">
              Monarx AI Store
            </span>
          </Link>

          {/* Catalog button */}
          <Link
            href={makeUrl({ section: "products" })}
            className="hidden md:inline-flex min-w-[140px] flex-none items-center justify-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 whitespace-nowrap"
          >
            <span className="inline-block h-3 w-3 rounded-[3px] border border-red-200" />
            AI Catalog
          </Link>

          {/* Search → ke /products */}
          <form
            className="flex-1"
            method="GET"
            action={makeUrl({ section: "products" })}
          >
            <input type="hidden" name="currency" value={uiCurrency} />
            <div className="flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm shadow-sm focus-within:border-red-500">
              <input
                type="text"
                name="q"
                placeholder={t.searchPlaceholder}
                className="flex-1 bg-transparent text-xs text-slate-900 outline-none placeholder:text-slate-400"
              />
              <button
                type="submit"
                className="inline-flex w-20 items-center justify-center rounded-full bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-500"
              >
                Search
              </button>
            </div>
          </form>

          {/* Right: currency, language, auth */}
          <div className="hidden items-center gap-3 md:flex">
            {/* Currency toggle */}
            <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-1 py-1 text-[11px]">
              <Link
                href={makeUrl({ currency: "USD" })}
                className={`rounded-full px-2 py-0.5 ${uiCurrency === "USD"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
                  }`}
              >
                USD
              </Link>
              <Link
                href={makeUrl({ currency: "CNY" })}
                className={`rounded-full px-2 py-0.5 ${uiCurrency === "CNY"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
                  }`}
              >
                CNY
              </Link>
            </div>

            {/* Language toggle */}
            <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-1 py-1 text-[11px]">
              <Link
                href={makeUrl({ locale: "en" })}
                className={`inline-flex w-10 items-center justify-center rounded-full px-2 py-0.5 ${uiLanguage === "en"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
                  }`}
              >
                EN
              </Link>
              <Link
                href={makeUrl({ locale: "zh" })}
                className={`inline-flex w-10 items-center justify-center rounded-full px-2 py-0.5 ${uiLanguage === "zh"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
                  }`}
              >
                中文
              </Link>
            </div>

            {/* Auth */}
            {currentUser ? (
              <div className="relative">
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-700 hover:bg-slate-50">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold uppercase text-white">
                      {(currentUser.name || currentUser.email).charAt(0)}
                    </div>
                    <span className="max-w-[140px] truncate">
                      {currentUser.name || currentUser.email}
                    </span>
                    <span className="text-[10px] text-slate-400">▾</span>
                  </summary>

                  <div className="absolute right-0 z-20 mt-2 w-44 rounded-2xl border border-slate-200 bg-white py-1 shadow-lg">
                    <div className="px-3 pb-1 pt-1.5 text-[10px] text-slate-400">
                      {t.navSignedInAs}
                      <div className="truncate text-[11px] font-medium text-slate-800">
                        {currentUser.email}
                      </div>
                    </div>

                    <hr className="my-1 border-slate-100" />

                    <Link
                      href={`/${locale}/account`}
                      className="block px-3 py-1.5 text-[11px] text-slate-700 hover:bg-slate-50"
                    >
                      {t.navProfile}
                    </Link>

                    <button
                      type="button"
                      disabled
                      className="flex w-full items-center justify-between px-3 py-1.5 text-[11px] text-slate-400 hover:bg-slate-50"
                    >
                      {t.navOrderHistory}
                      <span className="rounded-full bg-slate-100 px-1.5 text-[9px] uppercase">
                        {t.navOrderHistorySoon}
                      </span>
                    </button>

                    {currentUser.isAdmin && (
                      <Link
                        href={`/${locale}/admin/products`}
                        className="block px-3 py-1.5 text-[11px] text-red-600 hover:bg-red-50"
                      >
                        {t.navAdminPanel}
                      </Link>
                    )}

                    <hr className="my-1 border-slate-100" />

                    <form action="/api/auth/logout" method="POST">
                      <button
                        type="submit"
                        className="flex w-full items-center justify-between px-3 py-1.5 text-[11px] font-medium text-red-600 hover:bg-red-50"
                      >
                        {t.navSignOut}
                      </button>
                    </form>
                  </div>
                </details>
              </div>
            ) : (
              <>
                <Link
                  href={`/${locale}/login?currency=${uiCurrency}&redirect=${encodeURIComponent(
                    productRedirectPath
                  )}`}
                  className="inline-flex w-20 items-center justify-center rounded-full border border-slate-200 px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  {t.navSignIn}
                </Link>
                <Link
                  href={`/${locale}/register`}
                  className="inline-flex w-20 items-center justify-center rounded-full bg-slate-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-black"
                >
                  {t.navSignUp}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          {/* LEFT: product info */}
          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-red-500">
                {t.productBadge}
              </p>
              <h1 className="mt-2 text-lg font-semibold tracking-tight md:text-xl">
                {product.name}
              </h1>
              <p className="mt-1 text-xs text-slate-500">
                {product.description}
              </p>

              <div className="mt-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-500">{t.priceLabel}</p>
                  <p className="text-xl font-semibold text-red-600">
                    {formatPriceForUi( product.price, uiCurrency)}
                  </p>
                  <p className="mt-1 text-[10px] text-slate-400">
                    {currencyLabel}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">{t.stockLabel}</p>
                  <p
                    className={
                      "text-sm font-semibold " +
                      (isOutOfStock ? "text-red-500" : "text-emerald-600")
                    }
                  >
                    {isOutOfStock
                      ? t.stockOut
                      : `${availableItemCount} ${t.stockAvailableSuffix}`}
                  </p>
                </div>
              </div>

              {/* image */}
              <div className="mt-5 overflow-hidden rounded-2xl bg-slate-100">
                <div className="relative w-full aspect-[16/9]">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* description block */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
              <p className="text-xs font-semibold text-slate-900">
                {t.descriptionTitle}
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                {t.descriptionHint}
              </p>

              <div className="mt-3 rounded-2xl bg-slate-50 p-4 text-[11px] text-slate-700">
                {product.description}
              </div>
            </div>
          </div>

          {/* RIGHT: checkout */}
          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
              <p className="text-xs font-semibold text-slate-900">
                {t.checkoutTitle}
              </p>
              <p className="mt-1 text-[11px] text-slate-600">
                {isLoggedIn
                  ? t.checkoutSubtitleLoggedIn.replace(
                    "{email}",
                    currentUser!.email ?? ""
                  )
                  : t.checkoutSubtitleGuest}
              </p>

              <form
                action="/api/orders"
                method="POST"
                className="mt-3 space-y-3 text-xs"
              >
                {/* hidden fields */}
                <input type="hidden" name="productSlug" value={product.slug} />
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="currency" value={uiCurrency} />

                {/* EMAIL */}
                <div className="space-y-1">
                  <label
                    htmlFor="email"
                    className="block text-[11px] font-medium text-slate-800"
                  >
                    {t.emailLabel}
                  </label>

                  {isLoggedIn ? (
                    <>
                      <input
                        type="hidden"
                        name="email"
                        value={currentUser!.email || ""}
                      />
                      <p className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
                        {currentUser!.email}
                      </p>
                    </>
                  ) : (
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="you@example.com"
                      className="w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none placeholder:text-slate-400 focus:border-red-500"
                      disabled={isOutOfStock}
                    />
                  )}
                </div>

                {/* PAYMENT METHOD (NEW) */}
                <div className="space-y-1">
                  <p className="text-[11px] font-medium text-slate-800">
                    {t.paymentMethodTitle}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {t.paymentMethodHelp}
                  </p>
                  <div className="mt-2 grid gap-2">
                    <label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] hover:border-red-400">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="ALIPAY"
                        defaultChecked
                        className="h-3 w-3"
                        disabled={isOutOfStock}
                      />
                      <span>{t.paymentMethodAlipay}</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] hover:border-red-400">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="WECHAT"
                        className="h-3 w-3"
                        disabled={isOutOfStock}
                      />
                      <span>{t.paymentMethodWeChat}</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] hover:border-red-400">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="MANUAL"
                        className="h-3 w-3"
                        disabled={isOutOfStock}
                      />
                      <span>{t.paymentMethodManual}</span>
                    </label>
                  </div>
                </div>

                {/* NOTES */}
                <div className="space-y-1">
                  <label
                    htmlFor="notes"
                    className="block text-[11px] font-medium text-slate-800"
                  >
                    {t.notesLabel}
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={2}
                    placeholder={t.notesPlaceholder}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none placeholder:text-slate-400 focus:border-red-500"
                    disabled={isOutOfStock}
                  />
                </div>

                <button
                  type="submit"
                  className="mt-2 w-full rounded-full bg-red-600 py-2 text-xs font-semibold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-slate-300"
                  disabled={isOutOfStock}
                >
                  {isOutOfStock ? t.outOfStockButton : t.placeOrder}
                </button>

                <p className="text-[10px] text-slate-500">
                  {t.checkoutInfoNote}
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
