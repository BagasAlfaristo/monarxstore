// i18n/request.ts
import {getRequestConfig} from "next-intl/server";
import {locales, defaultLocale} from "../i18n";

export default getRequestConfig(async ({requestLocale}) => {
  // requestLocale adalah Promise<string | undefined>
  const requested = (await requestLocale) ?? defaultLocale;

  // pastikan locale yang dipakai selalu salah satu dari `locales`
  const locale = (locales as readonly string[]).includes(requested)
    ? requested
    : defaultLocale;

  return {
    // ⬅️ penting: properti `locale` WAJIB ada
    locale,
    // ambil file messages sesuai locale
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
