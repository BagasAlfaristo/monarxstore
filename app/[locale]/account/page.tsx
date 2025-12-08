// app/[locale]/account/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import type { Locale } from "@/i18n";

type UiCurrency = "USD" | "CNY";
type UiLanguage = "en" | "zh";

interface AccountPageProps {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ currency?: string }>;
}

type MakeUrlOverrides = {
  currency?: UiCurrency;
  locale?: Locale;
  section?: "home" | "products" | "login" | "register" | "account";
  q?: string;
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

    pageTitle: "My account",
    pageSubtitle:
      "View your profile and orders created with this email/account.",
    profileTitle: "Profile",
    profileEmail: "Email",
    profileName: "Name",
    profileRoleAdmin: "Admin",
    profileRoleUser: "User",

    ordersTitle: "My orders",
    ordersEmptyTitle: "No orders yet",
    ordersEmptyBody:
      "Orders created with your email will appear here after checkout.",
    orderStatus: "Status",
    orderCreatedAt: "Created at",
    orderProduct: "Product",
    orderViewDetail: "View order",
    orderStatusPending: "Pending",
    orderStatusPaid: "Paid",
    orderStatusFailed: "Failed",

    ordersAmount: "Amount (snapshot)",
    ordersPaymentMethod: "Payment method",
    ordersItemsCount: "Delivered items",

    paymentMethodAlipay: "Alipay",
    paymentMethodWechat: "WeChat",
    paymentMethodManual: "Manual",
    paymentMethodUnknown: "Unknown",
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

    pageTitle: "个人中心",
    pageSubtitle: "查看与你帐号 / 邮箱相关的订单信息。",
    profileTitle: "个人信息",
    profileEmail: "邮箱",
    profileName: "名称",
    profileRoleAdmin: "管理员",
    profileRoleUser: "普通用户",

    ordersTitle: "我的订单",
    ordersEmptyTitle: "暂时还没有订单",
    ordersEmptyBody: "使用当前邮箱创建的订单会出现在这里。",
    orderStatus: "订单状态",
    orderCreatedAt: "创建时间",
    orderProduct: "商品",
    orderViewDetail: "查看订单",
    orderStatusPending: "待付款",
    orderStatusPaid: "已付款",
    orderStatusFailed: "失败",

    ordersAmount: "金额（快照）",
    ordersPaymentMethod: "支付方式",
    ordersItemsCount: "已发货条目",

    paymentMethodAlipay: "支付宝",
    paymentMethodWechat: "微信支付",
    paymentMethodManual: "人工/其他",
    paymentMethodUnknown: "未知",
  },
} as const;

export default async function AccountPage({
  params,
  searchParams,
}: AccountPageProps) {
  const { locale } = await params;
  const qs = await searchParams;

  const uiCurrency: UiCurrency = qs?.currency === "CNY" ? "CNY" : "USD";
  const uiLanguage: UiLanguage = locale === "zh" ? "zh" : "en";
  const t = dict[uiLanguage];

  const makeUrl = (overrides: MakeUrlOverrides = {}) => {
    const targetLocale = overrides.locale ?? locale;
    const targetCurrency = overrides.currency ?? uiCurrency;
    const section = overrides.section ?? "account";
    const q = (overrides.q ?? "").trim();

    const basePath =
      section === "home"
        ? `/${targetLocale}`
        : section === "products"
        ? `/${targetLocale}/products`
        : section === "login"
        ? `/${targetLocale}/login`
        : section === "register"
        ? `/${targetLocale}/register`
        : `/${targetLocale}/account`;

    const sp = new URLSearchParams();
    if (targetCurrency) sp.set("currency", targetCurrency);
    if (q) sp.set("q", q);

    const query = sp.toString();
    return query ? `${basePath}?${query}` : basePath;
  };

  const accountUrl = `/${locale}/account?currency=${uiCurrency}`;
  const loginWithRedirect = `/${locale}/login?currency=${uiCurrency}&redirect=${encodeURIComponent(
    accountUrl
  )}`;

  // --- auth user wajib (kalau nggak login, redirect manual ke login) ---
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    // kalau belum login, simple UX: suruh ke login
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center text-sm">
          <p className="text-base font-semibold text-slate-900">
            {uiLanguage === "en" ? "Please sign in first" : "请先登录帐号"}
          </p>
          <p className="mt-2 text-xs text-slate-600">
            {uiLanguage === "en"
              ? "You need to sign in to access your account dashboard."
              : "登录后才能查看你的个人信息与订单记录。"}
          </p>
          <div className="mt-4 inline-flex gap-2">
            <Link
              href={loginWithRedirect}
              className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-black"
            >
              {t.navSignIn}
            </Link>
            <Link
              href={makeUrl({ section: "register" })}
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
            >
              {t.navSignUp}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // --- ambil orders milik user ---
  // prefer pakai userId, fallback ke email (buat order lama).
  const orders = await prisma.order.findMany({
    where: {
      OR: [{ userId: currentUser.id }, { email: currentUser.email }],
    },
    orderBy: { createdAt: "desc" },
    include: {
      product: true,
      items: true, // ⬅️ include items supaya bisa hitung jumlah delivered
    },
  });

  const statusLabel = (status: string) => {
    if (status === "PAID") return t.orderStatusPaid;
    if (status === "FAILED") return t.orderStatusFailed;
    return t.orderStatusPending;
  };

  const statusClass = (status: string) => {
    if (status === "PAID")
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (status === "FAILED")
      return "bg-red-50 text-red-700 border-red-200";
    return "bg-amber-50 text-amber-700 border-amber-200";
  };

  const roleLabel = currentUser.isAdmin
    ? t.profileRoleAdmin
    : t.profileRoleUser;

  const paymentMethodLabel = (method?: string | null) => {
    if (method === "ALIPAY") return t.paymentMethodAlipay;
    if (method === "WECHAT") return t.paymentMethodWechat;
    if (method === "MANUAL") return t.paymentMethodManual;
    return t.paymentMethodUnknown;
  };

  const formatAmount = (amount: number | null, currency?: string | null) => {
    if (!amount || !currency) return "-";
    return `${amount} ${currency}`;
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* HEADER – pattern sama dengan login/register/products */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
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

          <Link
            href={makeUrl({ section: "products" })}
            className="hidden md:inline-flex min-w-[140px] flex-none items-center justify-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 whitespace-nowrap"
          >
            <span className="inline-block h-3 w-3 rounded-[3px] border border-red-200" />
            AI Catalog
          </Link>

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

            {/* Auth dropdown (user sudah login) */}
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
                    href={makeUrl({ section: "account" })}
                    className="block px-3 py-1.5 text-[11px] text-slate-700 hover:bg-slate-50"
                  >
                    {t.navProfile}
                  </Link>

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
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <div className="mx-auto max-w-6xl px-4 pb-10 pt-8">
        <div className="mb-5">
          <h1 className="text-lg font-semibold text-slate-900 md:text-xl">
            {t.pageTitle}
          </h1>
          <p className="mt-1 text-xs text-slate-600">{t.pageSubtitle}</p>
        </div>

        <div className="grid gap-5 md:grid-cols-[minmax(0,2.2fr)_minmax(0,3fr)]">
          {/* Profile card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <p className="text-xs font-semibold text-slate-900">
              {t.profileTitle}
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold uppercase text-white">
                {(currentUser.name || currentUser.email).charAt(0)}
              </div>
              <div className="text-[11px]">
                <p className="font-semibold text-slate-900">
                  {currentUser.name || currentUser.email}
                </p>
                <p className="text-slate-500">{roleLabel}</p>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-[11px] text-slate-700">
              <div className="rounded-2xl bg-slate-50 px-3 py-2">
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                  {t.profileEmail}
                </p>
                <p className="mt-0.5 text-xs">{currentUser.email}</p>
              </div>
              {currentUser.name && (
                <div className="rounded-2xl bg-slate-50 px-3 py-2">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                    {t.profileName}
                  </p>
                  <p className="mt-0.5 text-xs">{currentUser.name}</p>
                </div>
              )}
            </div>
          </div>

          {/* Orders list */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <p className="text-xs font-semibold text-slate-900">
              {t.ordersTitle}
            </p>

            {orders.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-[11px] text-slate-600">
                <p className="font-semibold text-slate-900">
                  {t.ordersEmptyTitle}
                </p>
                <p className="mt-1 text-[11px] text-slate-600">
                  {t.ordersEmptyBody}
                </p>
                <div className="mt-3 inline-flex gap-2">
                  <Link
                    href={makeUrl({ section: "products" })}
                    className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-black"
                  >
                    Go to products
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-3 text-[11px]">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-900">
                        {t.orderProduct}: {order.product?.name ?? "-"}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {t.orderCreatedAt}:{" "}
                        {order.createdAt.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {t.orderStatus}:{" "}
                        <span
                          className={
                            "inline-flex rounded-full border px-2 py-0.5 " +
                            statusClass(order.status)
                          }
                        >
                          {statusLabel(order.status)}
                        </span>
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {t.ordersAmount}:{" "}
                        <span className="font-mono">
                          {formatAmount(order.amount, order.currency)}
                        </span>
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {t.ordersPaymentMethod}:{" "}
                        {paymentMethodLabel(order.paymentMethod)}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {t.ordersItemsCount}:{" "}
                        <span className="font-semibold">
                          {order.items?.length ?? 0}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/${locale}/order-success?id=${order.id}&currency=${uiCurrency}`}
                        className="inline-flex items-center justify-center rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-800 shadow-sm hover:bg-slate-100"
                      >
                        {t.orderViewDetail}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
