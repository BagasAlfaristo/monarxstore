// next-intl.config.ts
import {getRequestConfig} from "next-intl/server";
import {locales, type Locale as AppLocale} from "./i18n";

export default getRequestConfig(async ({ locale }) => {
  // fallback kalau locale undefined / aneh → "en"
  const finalLocale: AppLocale = locales.includes(locale as AppLocale)
    ? (locale as AppLocale)
    : "en";

  return {
    // ✅ shape yang diminta RequestConfig
    locale: finalLocale,
    messages: (await import(`./messages/${finalLocale}.json`)).default,
  };
});
