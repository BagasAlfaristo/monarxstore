// app/[locale]/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { cookies } from "next/headers";

import { getFeaturedProducts } from "@/lib/products";
import { countAvailableItemsByProduct } from "@/lib/productItems";
import {
  AUTH_COOKIE_NAME,
  verifyAuthToken,
  type AuthTokenPayload,
} from "@/lib/auth";
import type { Locale } from "@/i18n";

type UiCurrency = "USD" | "CNY";
type UiLanguage = "en" | "zh";

interface HomePageProps {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{
    currency?: string;
  }>;
}

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

export default async function Home({ params, searchParams }: HomePageProps) {
  // --- locale & query ---
  const { locale } = await params;
  const qs = await searchParams;

  const uiCurrency: UiCurrency = qs?.currency === "CNY" ? "CNY" : "USD";
  const uiLanguage: UiLanguage = locale === "zh" ? "zh" : "en";

  const makeUrl = (
    overrides: Partial<{ currency: UiCurrency; locale: Locale }>
  ) => {
    const targetLocale = overrides.locale ?? locale;
    const targetCurrency = overrides.currency ?? uiCurrency;

    const sp = new URLSearchParams();
    if (targetCurrency) sp.set("currency", targetCurrency);
    const query = sp.toString();

    return query ? `/${targetLocale}?${query}` : `/${targetLocale}`;
  };

  // text dictionary (base Inggris, zh = auto translate)
  const dict = {
    en: {
      heroBadge: "AI DIGITAL STORE",
      heroTitleLine1: "Your reliable marketplace",
      heroTitleLine2: "for digital goods and services.",
      heroBody:
        "ChatGPT, Claude, Gemini, Midjourney, Perplexity and more — everything in one place.",
      heroPrimaryCta: "Explore AI products",
      heroSecondaryCta: "Contact support",

      searchPlaceholder: "Search AI products",
      navSignIn: "Sign in",
      navSignUp: "Sign up",
      navProfile: "Profile",
      navOrderHistory: "Order history",
      navOrderHistorySoon: "Soon",
      navAdminPanel: "Admin panel",
      navSignedInAs: "Signed in as",
      navSignOut: "Sign out",

      whyTitle: "Why choose Monarx AI Store?",
      whyCards: [
        {
          title: "Auto-delivery",
          body: "Products are delivered automatically once payment is completed.",
        },
        {
          title: "Trusted platform",
          body: "One place to manage all AI accounts / codes in a clean and controlled way.",
        },
        {
          title: "Merchant auto-redeem",
          body: "Can be connected to official merchant channels for automatic redeem.",
        },
        {
          title: "Auto renewal",
          body: "Subscriptions can be renewed automatically or manually from the panel.",
        },
      ],

      featuredTitle: "Featured AI products",
      //featuredSubtitle:
      //"Products are loaded from the database. You control which ones are featured from the admin panel.",
      //featuredPriceHint: "Price display follows the currency selected at the top.",
      featuredEmpty: "No products are marked as featured yet.",

      stockLabel: "Stock",
      stockOut: "Out of stock",
      stockAvailableSuffix: "available",

      priceLabel: "Price",

      howTitle: "How to buy (concept)",
      howSubtitle:
        "You can adjust this flow according to the payment channels you use.",
      howSteps: [
        {
          title: "1. Choose AI product",
          desc: "Select ChatGPT, Claude, Gemini, etc. from the catalog.",
        },
        {
          title: "2. Pay via preferred channel",
          desc: "Alipay, WeChat, bank transfer, USDT or any gateway you configure.",
        },
        {
          title: "3. Receive access",
          desc: "Account / code is delivered automatically once payment is confirmed.",
        },
      ],
      howCheckoutTitle: "Checkout example",
      howCheckoutDesc:
        "Just a visual example of what it looks like when buyers pick several AI products.",
      howCheckoutButton: "Pay now (example)",

      footerStoreTitle: "Monarx AI Store",
      footerStoreBody:
        "Simple landing for AI subscriptions & credits. You can connect it to your own backend and payment system.",
      footerBuyersTitle: "For buyers",
      footerBuyers: ["FAQ", "How to order", "Refund rules"],
      footerPartnersTitle: "For partners",
      footerPartners: ["Reseller program", "Bulk orders", "API access"],
      footerLegalTitle: "Legal & docs",
      footerLegal: ["User agreement", "Privacy policy", "Terms of service"],
      footerCopyPrefix: "©",
    },
    zh: {
      heroBadge: "AI 数字商店",
      heroTitleLine1: "值得信赖的数字商品平台，",
      heroTitleLine2: "专注各类 AI 服务与账号。",
      heroBody:
        "ChatGPT、Claude、Gemini、Midjourney、Perplexity 等热门 AI 账号与服务，一站式购买管理。",
      heroPrimaryCta: "浏览全部 AI 商品",
      heroSecondaryCta: "联系客服",

      searchPlaceholder: "搜索 AI 商品",
      navSignIn: "登录",
      navSignUp: "注册",
      navProfile: "个人中心",
      navOrderHistory: "订单记录",
      navOrderHistorySoon: "即将上线",
      navAdminPanel: "管理后台",
      navSignedInAs: "当前登录帐号",
      navSignOut: "退出登录",

      whyTitle: "为什么选择 Monarx AI Store？",
      whyCards: [
        {
          title: "自动发货",
          body: "订单支付成功后，系统自动下发账号或兑换码，无需人工值守。",
        },
        {
          title: "平台统一管理",
          body: "所有 AI 账号与兑换码集中管理，清晰可控，方便对账与售后。",
        },
        {
          title: "商家渠道自动兑换",
          body: "可对接官方商家渠道，支持自动兑换与自动写入，降低人工操作风险。",
        },
        {
          title: "自动续费 / 续期",
          body: "订阅类商品可以设置自动续期，也可以由运营在后台手动续费。",
        },
      ],

      featuredTitle: "推荐 AI 商品",
      //featuredSubtitle:
      //"商品数据来自数据库，你可以在管理后台自由设置哪些商品展示在首页。",
      //featuredPriceHint: "价格展示会根据顶部选择的货币（USD / CNY）自动切换。",
      featuredEmpty: "暂时还没有被设置为推荐的商品。",

      stockLabel: "库存",
      stockOut: "暂时售罄",
      stockAvailableSuffix: "个可用",

      priceLabel: "价格",

      howTitle: "购买流程示意",
      howSubtitle: "实际流程可以根据你使用的支付渠道进行调整。",
      howSteps: [
        {
          title: "1. 选择 AI 商品",
          desc: "在商品列表中选择 ChatGPT、Claude、Gemini 等你需要的套餐。",
        },
        {
          title: "2. 使用常用渠道支付",
          desc: "支持接入支付宝、微信、银行卡、USDT 等第三方支付渠道。",
        },
        {
          title: "3. 自动发货 / 获取访问权限",
          desc: "支付成功后系统自动发货，买家即可收到账号或兑换码以及使用说明。",
        },
      ],
      howCheckoutTitle: "结算示例",
      howCheckoutDesc: "仅作为展示示意，实际价格与支付方式可以在后台自定义配置。",
      howCheckoutButton: "立即支付（示意）",

      footerStoreTitle: "Monarx AI Store",
      footerStoreBody:
        "专注 AI 订阅与点数类商品的简单落地页，可与自有后台、风控和支付系统对接。",
      footerBuyersTitle: "买家服务",
      footerBuyers: ["常见问题", "购买流程", "退款说明"],
      footerPartnersTitle: "合作伙伴",
      footerPartners: ["代理 / 分销", "大宗采购", "系统对接 API"],
      footerLegalTitle: "协议与条款",
      footerLegal: ["用户协议", "隐私政策", "服务条款"],
      footerCopyPrefix: "版权所有",
    },
  } as const;

  const t = dict[uiLanguage];

  // --- Auth user dari cookie ---
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

  // --- Data produk featured + stok item ---
  const rawFeatured = await getFeaturedProducts(6);
  const featuredProducts = await Promise.all(
    rawFeatured.map(async (p) => {
      const availableCount = await countAvailableItemsByProduct(p.id);
      return { ...p, availableCount };
    })
  );

  const currencyLabel =
    uiCurrency === "USD" ? "USD • $" : "CNY • ¥";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* HEADER / TOP BAR */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          {/* Logo + brand */}
          <Link href={makeUrl({})} className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-600 text-[11px] font-bold text-white">
              AI
            </div>
            <span className="text-lg font-semibold tracking-tight">
              Monarx AI Store
            </span>
          </Link>

          {/* Catalog button */}
          <Link
            href={`/${locale}/products?currency=${uiCurrency}`}
            className="hidden md:inline-flex min-w-[140px] flex-none items-center justify-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 whitespace-nowrap"
          >
            <span className="inline-block h-3 w-3 rounded-[3px] border border-red-200" />
            AI Catalog
          </Link>

          {/* Search */}
          <form className="flex-1">
            <div className="flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm shadow-sm focus-within:border-red-500">
              <input
                type="text"
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

            {/* Language toggle → pindah locale */}
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
                        href={`/admin/products`}
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

      {/* HERO */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-6 md:pt-8">
          <div className="grid gap-6 md:grid-cols-[minmax(0,3fr)_minmax(0,2.3fr)]">
            <div className="rounded-3xl bg-white px-6 py-8 shadow-sm md:px-8 md:py-10">
              <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-red-500">
                {t.heroBadge}
              </p>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
                {t.heroTitleLine1}
                <span className="block text-slate-700">
                  {t.heroTitleLine2}
                </span>
              </h1>
              <p className="mt-4 text-xs leading-relaxed text-slate-600 md:text-sm">
                {t.heroBody}
              </p>
              <div className="mt-5 flex flex-wrap gap-3 text-xs">
                <Link
                  href={`/${locale}/products?currency=${uiCurrency}`}
                  className="rounded-full bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-500"
                >
                  {t.heroPrimaryCta}
                </Link>
                <button className="rounded-full border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50">
                  {t.heroSecondaryCta}
                </button>
              </div>
              <p className="mt-3 text-[11px] text-slate-500">
                {currencyLabel}
              </p>
            </div>

            <div className="flex items-stretch justify-center">
              <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold text-slate-800">
                  Example AI bundle
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

      {/* WHY MONARX */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 pb-8">
          <div className="rounded-3xl bg-white px-5 py-6 shadow-sm md:px-7 md:py-7">
            <h2 className="text-sm font-semibold text-slate-900 md:text-base">
              {t.whyTitle}
            </h2>

            <div className="mt-5 grid gap-4 md:grid-cols-4">
              {t.whyCards.map((item) => (
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

      {/* FEATURED PRODUCTS */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 pb-10">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 md:text-base">
                {t.featuredTitle}
              </h2>
              <p className="mt-1 text-xs text-slate-600">
                {/*  {t.featuredSubtitle} */}
              </p>
              <p className="mt-1 text-[10px] text-slate-400">
                {/*  {t.featuredPriceHint}*/}
              </p>
            </div>
            <Link
              href={`/${locale}/products?currency=${uiCurrency}`}
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-800 hover:bg-slate-50 min-w-[120px]"
            >
              View all products
            </Link>
          </div>

          {featuredProducts.length === 0 ? (
            <p className="text-xs text-slate-500">{t.featuredEmpty}</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {featuredProducts.map((p) => {
                const isOutOfStock = p.availableCount <= 0;
                return (
                  <Link
                    href={`/${locale}/products/${p.slug}?currency=${uiCurrency}`}
                    key={p.id}
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
                        <span className="text-sm font-semibold text-red-600">
                          {formatPriceForUi(p.price, uiCurrency)}
                        </span>
                      </div>

                      <div className="mt-1 text-[11px] text-slate-500">
                        {t.stockLabel}:{" "}
                        <span
                          className={
                            isOutOfStock ? "font-semibold text-red-500" : ""
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

      {/* HOW TO BUY */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 pb-10">
          <div className="grid gap-6 md:grid-cols-[minmax(0,3fr)_minmax(0,2.2fr)]">
            <div className="rounded-3xl bg-white px-5 py-6 shadow-sm md:px-7 md:py-7">
              <h2 className="text-sm font-semibold text-slate-900 md:text-base">
                {t.howTitle}
              </h2>
              <p className="mt-1 text-xs text-slate-600">
                {t.howSubtitle}
              </p>

              <div className="mt-5 space-y-3 text-xs">
                {t.howSteps.map((step) => (
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

            <div className="flex items-center justify-center">
              <div className="w-full max-w-xs rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold text-slate-900">
                  {t.howCheckoutTitle}
                </p>
                <p className="mt-1 text-[11px] text-slate-600">
                  {t.howCheckoutDesc}
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
                  {t.howCheckoutButton}
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
                {t.footerStoreTitle}
              </p>
              <p className="mt-2 max-w-xs text-[11px] text-slate-600">
                {t.footerStoreBody}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900">
                {t.footerBuyersTitle}
              </p>
              <ul className="mt-2 space-y-1">
                {t.footerBuyers.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900">
                {t.footerPartnersTitle}
              </p>
              <ul className="mt-2 space-y-1">
                {t.footerPartners.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900">
                {t.footerLegalTitle}
              </p>
              <ul className="mt-2 space-y-1">
                {t.footerLegal.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
            <span className="text-xs text-slate-500">
              {t.footerCopyPrefix} {new Date().getFullYear()}, Monarx AI Store
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
