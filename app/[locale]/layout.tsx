import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { locales, type Locale } from "@/i18n";

export const dynamic = "force-dynamic";

type Props = {
  children: ReactNode;
  // ⚠️ sekarang params adalah Promise
  params: Promise<{
    locale: string;
  }>;
};

async function getMessages(locale: Locale) {
  try {
    const messages = (await import(`../../messages/${locale}.json`)).default;
    return messages;
  } catch (error) {
    return null;
  }
}

export default async function LocaleLayout({ children, params }: Props) {
  // 👇 ini penting: await params dulu
  const { locale: rawLocale } = await params;

  if (!locales.includes(rawLocale as Locale)) {
    notFound();
  }

  const locale = rawLocale as Locale;

  const messages = await getMessages(locale);
  if (!messages) {
    notFound();
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
