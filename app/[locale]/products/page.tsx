// app/[locale]/products/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { cookies } from "next/headers";

import { getAllProducts, formatPrice } from "@/lib/products";
import { countAvailableItemsByProduct } from "@/lib/productItems";
import {
  AUTH_COOKIE_NAME,
  verifyAuthToken,
  type AuthTokenPayload,
} from "@/lib/auth";
import type { Locale } from "@/i18n";

type UiCurrency = "USD" | "CNY";
type UiLanguage = "en" | "zh";

interface ProductsPageProps {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{
    currency?: string;
    q?: string;
  }>;
}

// helper: format harga sesuai UI currency (copy dari home)
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
    if (uiCurrency === "USD") {
      return usdFmt.format(price);
    }
    const cny = price * RATE_USD_TO_CNY;
    return cnyFmt.format(cny);
  }

  if (baseCurrency === "CNY") {
    if (uiCurrency === "CNY") {
      return cnyFmt.format(price);
    }
    const usd = price / RATE_USD_TO_CNY;
    return usdFmt.format(usd);
  }

  return formatPrice(price, baseCurrency);
}

type MakeUrlOverrides = {
  currency?: UiCurrency;
  locale?: Locale;
  q?: string;
  section?: "home" | "products";
};

export default async function ProductsPage({
  params,
  searchParams,
}: ProductsPageProps) {
  const { locale } = await params;
  const qs = await searchParams;

  const uiCurrency: UiCurrency = qs?.currency === "CNY" ? "CNY" : "USD";
  const uiLanguage: UiLanguage = locale === "zh" ? "zh" : "en";
  const searchQuery = (qs?.q ?? "").trim();

  const makeUrl = (overrides: MakeUrlOverrides = {}) => {
    const targetLocale = overrides.locale ?? locale;
    const targetCurrency = overrides.currency ?? uiCurrency;
    const targetQuery = overrides.q ?? searchQuery;
    const section = overrides.section ?? "products";

    const basePath =
      section === "home"
        ? `/${targetLocale}`
        : `/${targetLocale}/products`;

    const sp = new URLSearchParams();
    if (targetCurrency) sp.set("currency", targetCurrency);
    if (targetQuery) sp.set("q", targetQuery);

    const query = sp.toString();
    return query ? `${basePath}?${query}` : basePath;
  };

  const dict = {
    en: {
      searchPlaceholder: "Search AI products",
      navSignIn: "Sign in",
      navSignUp: "Sign up",
      navProfile: "Profile",
      navOrderHistory: "Order history",
      navOrderHistorySoon: "Soon",
      navAdminPanel: "Admin panel",
      navSignedInAs: "Signed in as",
      navSignOut: "Sign out",

      pageTitle: "All products",
      pageSubtitle:
        "Collection of digital products / accounts / codes available in Monarx AI Store.",
      emptyTitle: "No products found",
      emptyBody:
        "Try changing the keyword or reset the filter to see all products.",

      stockLabel: "Stock",
      stockOut: "Out of stock",
      stockAvailableSuffix: "available",

      priceLabel: "Price",
      currencyPrefixUsd: "USD • $",
      currencyPrefixCny: "CNY • ¥",
    },
    zh: {
      searchPlaceholder: "搜索 AI 商品",
      navSignIn: "登录",
      navSignUp: "注册",
      navProfile: "个人中心",
      navOrderHistory: "订单记录",
      navOrderHistorySoon: "即将上线",
      navAdminPanel: "管理后台",
      navSignedInAs: "当前登录帐号",
      navSignOut: "退出登录",

      pageTitle: "全部商品",
      pageSubtitle:
        "Monarx AI Store 中可售卖的数字商品 / 账号 / 兑换码列表。",
      emptyTitle: "未找到相关商品",
      emptyBody: "请尝试修改关键词，或清空搜索以查看全部商品。",

      stockLabel: "库存",
      stockOut: "暂时售罄",
      stockAvailableSuffix: "个可用",

      priceLabel: "价格",
      currencyPrefixUsd: "USD • $",
      currencyPrefixCny: "CNY • ¥",
    },
  } as const;

  const t = dict[uiLanguage];

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

  // data products + stock
  const rawProducts = await getAllProducts();
  const productsWithStock = await Promise.all(
    rawProducts.map(async (p) => {
      const availableCount = await countAvailableItemsByProduct(p.id);
      return { ...p, availableCount };
    })
  );

  const filteredProducts =
    searchQuery.length === 0
      ? productsWithStock
      : productsWithStock.filter((p) => {
          const q = searchQuery.toLowerCase();
          return (
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q)
          );
        });

  const currencyLabel =
    uiCurrency === "USD" ? t.currencyPrefixUsd : t.currencyPrefixCny;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* HEADER – sama gaya dengan home */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          {/* Logo + brand */}
          <Link href={makeUrl({ section: "home", q: "" })} className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-600 text-[11px] font-bold text-white">
              AI
            </div>
            <span className="text-lg font-semibold tracking-tight">
              Monarx AI Store
            </span>
          </Link>

          {/* Catalog button (active page) */}
          <Link
            href={makeUrl({ section: "products" })}
            className="hidden md:inline-flex min-w-[140px] flex-none items-center justify-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 whitespace-nowrap"
          >
            <span className="inline-block h-3 w-3 rounded-[3px] border border-red-200" />
            AI Catalog
          </Link>

          {/* Search */}
          <form
            className="flex-1"
            method="GET"
            action={makeUrl({ section: "products" })}
          >
            {/* supaya currency tetap kebawa waktu search */}
            <input type="hidden" name="currency" value={uiCurrency} />
            <div className="flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm shadow-sm focus-within:border-red-500">
              <input
                type="text"
                name="q"
                defaultValue={searchQuery}
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
                className={`rounded-full px-2 py-0.5 ${
                  uiCurrency === "USD"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                USD
              </Link>
              <Link
                href={makeUrl({ currency: "CNY" })}
                className={`rounded-full px-2 py-0.5 ${
                  uiCurrency === "CNY"
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
                className={`inline-flex w-10 items-center justify-center rounded-full px-2 py-0.5 ${
                  uiLanguage === "en"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                EN
              </Link>
              <Link
                href={makeUrl({ locale: "zh" })}
                className={`inline-flex w-10 items-center justify-center rounded-full px-2 py-0.5 ${
                  uiLanguage === "zh"
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
                  href={`/${locale}/login`}
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
      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-6 md:pt-8">
          {/* <div className="mb-4">
            <h1 className="text-lg font-semibold text-slate-900 md:text-xl">
              {t.pageTitle}
            </h1>
            <p className="mt-1 text-xs text-slate-600">
              {t.pageSubtitle}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              {currencyLabel}
            </p>
          </div> */}

          {filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-8 text-center text-xs text-slate-500">
              <p className="font-semibold text-slate-800">{t.emptyTitle}</p>
              <p className="mt-1 text-[11px] text-slate-500">
                {t.emptyBody}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {filteredProducts.map((p) => {
                const isOutOfStock = p.availableCount <= 0;
                return (
                  <Link
                    key={p.id}
                    href={`/${locale}/products/${p.slug}?currency=${uiCurrency}`}
                    className="flex h-full flex-col rounded-2xl border border-slate-300 bg-white p-4 shadow shadow-slate-200/50 transition hover:border-red-400"
                  >
                    <div className="mb-3 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                      <div className="relative w-full aspect-[16/9]">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      </div>
                    </div>

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
                        <span className="text-slate-500">{t.priceLabel}</span>
                        <span className="text-sm font-semibold text-red-600">
                          {formatPriceForUi(p.price, p.currency, uiCurrency)}
                        </span>
                      </div>

                      <div className="mt-1 text-[11px] text-slate-500">
                        {t.stockLabel}:{" "}
                        <span
                          className={
                            isOutOfStock
                              ? "font-semibold text-red-500"
                              : ""
                          }
                        >
                          {isOutOfStock
                            ? t.stockOut
                            : `${p.availableCount} ${t.stockAvailableSuffix}`}
                        </span>
                      </div>
                    </div>

                    <span className="mt-3 inline-flex justify-center rounded-full bg-red-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-red-500">
                      View details
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
