// app/[locale]/register/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { cookies } from "next/headers";

import {
    AUTH_COOKIE_NAME,
    verifyAuthToken,
    type AuthTokenPayload,
} from "@/lib/auth";
import type { Locale } from "@/i18n";

type UiCurrency = "USD" | "CNY";
type UiLanguage = "en" | "zh";

interface RegisterPageProps {
    params: Promise<{ locale: Locale }>;
    searchParams: Promise<{
        currency?: string;
        redirect?: string;
    }>;
}

type MakeUrlOverrides = {
    currency?: UiCurrency;
    locale?: Locale;
    section?: "home" | "products" | "login" | "register";
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

        title: "Create a new account",
        subtitle:
            "Register once, then manage your AI products and orders from one place.",
        nameLabel: "Name (optional)",
        emailLabel: "Email",
        passwordLabel: "Password",
        buttonLabel: "Sign up",
        hasAccount: "Already have an account?",
        goLogin: "Sign in",
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

        title: "创建新帐号",
        subtitle: "注册后即可统一管理你的 AI 商品与订单。",
        nameLabel: "名称（可选）",
        emailLabel: "邮箱",
        passwordLabel: "密码",
        buttonLabel: "注册",
        hasAccount: "已经有帐号？",
        goLogin: "去登录",
    },
} as const;

export default async function RegisterPage({
    params,
    searchParams,
}: RegisterPageProps) {
    const { locale } = await params;
    const qs = await searchParams;

    const uiCurrency: UiCurrency = qs?.currency === "CNY" ? "CNY" : "USD";
    const uiLanguage: UiLanguage = locale === "zh" ? "zh" : "en";
    const t = dict[uiLanguage];
    const redirect = typeof qs?.redirect === "string" ? qs.redirect : "";

    const makeUrl = (overrides: MakeUrlOverrides = {}) => {
        const targetLocale = overrides.locale ?? locale;
        const targetCurrency = overrides.currency ?? uiCurrency;
        const section = overrides.section ?? "register";
        const q = (overrides.q ?? "").trim();

        const basePath =
            section === "home"
                ? `/${targetLocale}`
                : section === "products"
                    ? `/${targetLocale}/products`
                    : section === "login"
                        ? `/${targetLocale}/login`
                        : `/${targetLocale}/register`;

        const sp = new URLSearchParams();
        if (targetCurrency) sp.set("currency", targetCurrency);
        if (q) sp.set("q", q);

        const query = sp.toString();
        return query ? `${basePath}?${query}` : basePath;
    };

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

    return (
        <main className="min-h-screen bg-slate-50 text-slate-900">
            {/* HEADER – sama pattern */}
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
                                    href={makeUrl({ section: "login" })}
                                    className="inline-flex w-20 items-center justify-center rounded-full border border-slate-200 px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                >
                                    {t.navSignIn}
                                </Link>
                                <span className="inline-flex w-20 items-center justify-center rounded-full bg-slate-900 px-4 py-1.5 text-xs font-medium text-white">
                                    {t.navSignUp}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* CONTENT */}
            <div className="mx-auto flex max-w-6xl justify-center px-4 pb-10 pt-8">
                <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white px-6 py-7 shadow-sm">
                    <h1 className="text-base font-semibold text-slate-900 md:text-lg">
                        {t.title}
                    </h1>
                    <p className="mt-1 text-xs text-slate-600">{t.subtitle}</p>

                    <form
                        action="/api/auth/register"
                        method="POST"
                        className="mt-5 space-y-4 text-xs"
                    >
                        {redirect && (
                            <input type="hidden" name="redirect" value={redirect} />
                        )}
                        <div className="space-y-1">
                            <label
                                htmlFor="name"
                                className="block text-[11px] font-medium text-slate-800"
                            >
                                {t.nameLabel}
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                className="w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none placeholder:text-slate-400 focus:border-red-500"
                                placeholder=""
                            />
                        </div>

                        <div className="space-y-1">
                            <label
                                htmlFor="email"
                                className="block text-[11px] font-medium text-slate-800"
                            >
                                {t.emailLabel}
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none placeholder:text-slate-400 focus:border-red-500"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div className="space-y-1">
                            <label
                                htmlFor="password"
                                className="block text-[11px] font-medium text-slate-800"
                            >
                                {t.passwordLabel}
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none placeholder:text-slate-400 focus:border-red-500"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            className="mt-2 w-full rounded-full bg-red-600 py-2 text-xs font-semibold text-white hover:bg-red-500"
                        >
                            {t.buttonLabel}
                        </button>
                    </form>

                    <p className="mt-4 text-[11px] text-slate-600">
                        {t.hasAccount}{" "}
                        <Link
                            href={
                                redirect
                                    ? `${makeUrl({ section: "login" })}&redirect=${encodeURIComponent(
                                        redirect
                                    )}`
                                    : makeUrl({ section: "login" })}
                            className="font-semibold text-red-600 hover:underline"
                        >
                            {t.goLogin}
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
