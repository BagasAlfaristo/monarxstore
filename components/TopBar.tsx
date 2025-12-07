// components/TopBar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { type Locale, locales } from "@/i18n";
import { useMemo } from "react";

export function TopBar() {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();

  const { pathWithoutLocale } = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) {
      return { pathWithoutLocale: "" };
    }
    const [, ...rest] = segments; // buang locale segment
    return { pathWithoutLocale: rest.join("/") };
  }, [pathname]);

  function switchLocale(nextLocale: Locale) {
    if (nextLocale === locale) return;
    const newPath =
      pathWithoutLocale.length > 0
        ? `/${nextLocale}/${pathWithoutLocale}`
        : `/${nextLocale}`;
    router.push(newPath);
  }

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-20">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Left: logo + nav */}
        <div className="flex items-center gap-6">
          <Link href={`/${locale}`} className="font-semibold tracking-tight">
            {t("app.title")}
          </Link>
          <nav className="hidden md:flex items-center gap-4 text-sm text-slate-300">
            <Link href={`/${locale}`}>{t("nav.home")}</Link>
            <Link href={`/${locale}/products`}>{t("nav.products")}</Link>
            <Link href={`/${locale}/account`}>{t("nav.account")}</Link>
            {/* Admin link tetap ada, tapi bisa kamu sembunyikan jika user bukan admin */}
            <Link href={`/${locale}/admin`}>{t("nav.admin")}</Link>
          </nav>
        </div>

        {/* Right: language + placeholder auth buttons */}
        <div className="flex items-center gap-3 text-sm">
          {/* Language switcher */}
          <div className="flex rounded-full border border-slate-700 overflow-hidden">
            {locales.map((loc) => (
              <button
                key={loc}
                onClick={() => switchLocale(loc)}
                className={`px-3 py-1 text-xs md:text-sm ${
                  loc === locale
                    ? "bg-slate-100 text-slate-900"
                    : "bg-transparent text-slate-300"
                }`}
              >
                {loc === "en"
                  ? t("nav.language.en")
                  : t("nav.language.zh")}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
