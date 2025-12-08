// lib/currency.ts
export type UiCurrency = "USD" | "CNY";

const usdFmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const cnyFmt = new Intl.NumberFormat("zh-CN", {
  style: "currency",
  currency: "CNY",
});

// misal rate kasar saja, nanti bisa kamu tweak
const RATE_USD_TO_CNY = 7.1;

export function formatPriceForUiFromUsd(
  priceInUsd: number,
  uiCurrency: UiCurrency
): string {
  if (uiCurrency === "USD") {
    return usdFmt.format(priceInUsd);
  }

  const cny = priceInUsd * RATE_USD_TO_CNY;
  return cnyFmt.format(cny);
}
