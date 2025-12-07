// app/api/orders/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import {
  AUTH_COOKIE_NAME,
  verifyAuthToken,
  type AuthTokenPayload,
} from "@/lib/auth";
import type { Locale } from "@/i18n";

type UiCurrency = "USD" | "CNY";
// lokal type saja, jangan pakai tipe dari Prisma biar nggak rewel
type PaymentMethodValue = "ALIPAY" | "WECHAT" | "MANUAL";

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";

  let productSlug = "";
  let email = "";
  let notes = "";
  let locale: Locale = "en";
  let uiCurrency: UiCurrency = "USD";
  let paymentMethod: PaymentMethodValue | null = null;

  if (contentType.includes("application/json")) {
    const body = await request.json();

    productSlug = (body.productSlug ?? "").toString().trim();
    email = (body.email ?? "").toString().trim().toLowerCase();
    notes = (body.notes ?? "").toString().trim();

    const rawLocale = (body.locale ?? "en").toString();
    locale = rawLocale === "zh" ? "zh" : "en";

    const rawCurrency = (body.currency ?? "USD").toString();
    uiCurrency = rawCurrency === "CNY" ? "CNY" : "USD";

    const rawMethod = (body.paymentMethod ?? "")
      .toString()
      .toUpperCase();
    if (
      rawMethod === "ALIPAY" ||
      rawMethod === "WECHAT" ||
      rawMethod === "MANUAL"
    ) {
      paymentMethod = rawMethod as PaymentMethodValue;
    }
  } else {
    const formData = await request.formData();

    productSlug = (formData.get("productSlug") ?? "").toString().trim();
    email = (formData.get("email") ?? "").toString().trim().toLowerCase();
    notes = (formData.get("notes") ?? "").toString().trim();

    const rawLocale = (formData.get("locale") ?? "en").toString();
    locale = rawLocale === "zh" ? "zh" : "en";

    const rawCurrency = (formData.get("currency") ?? "USD").toString();
    uiCurrency = rawCurrency === "CNY" ? "CNY" : "USD";

    const rawMethod = (formData.get("paymentMethod") ?? "")
      .toString()
      .toUpperCase();
    if (
      rawMethod === "ALIPAY" ||
      rawMethod === "WECHAT" ||
      rawMethod === "MANUAL"
    ) {
      paymentMethod = rawMethod as PaymentMethodValue;
    }
  }

  // --- auth user (optional) ---
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  let authPayload: AuthTokenPayload | null = null;
  if (token) {
    try {
      authPayload = await verifyAuthToken(token);
    } catch {
      authPayload = null;
    }
  }

  if (!productSlug) {
    return NextResponse.json(
      { error: "Product slug is required" },
      { status: 400 }
    );
  }

  // kalau email kosong tapi user login → pakai email dari token
  if (!email && authPayload?.email) {
    email = authPayload.email.toLowerCase();
  }

  if (!email) {
    return NextResponse.json(
      { error: "Email is required" },
      { status: 400 }
    );
  }

  const product = await prisma.product.findUnique({
    where: { slug: productSlug },
  });

  if (!product) {
    return NextResponse.json(
      { error: "Product not found" },
      { status: 404 }
    );
  }

  // NOTE: snapshot harga + currency + payment method
  const order = await prisma.order.create({
    data: {
      productSlug: product.slug,
      email,
      notes: notes || null,
      status: "PENDING",
      userId: authPayload?.userId ?? null,

      amount: product.price,
      currency: product.currency,
      paymentMethod,
    } as any, // 👈 biar TS nggak rewel kalau Prisma Client belum ke-refresh
    include: {
      product: true,
    },
  });

  const accept = request.headers.get("accept") ?? "";
  const wantsJson = accept.includes("application/json");

  if (wantsJson) {
    return NextResponse.json(order, { status: 201 });
  }

  const redirectUrl = new URL(`/${locale}/order-success`, request.url);
  redirectUrl.searchParams.set("id", order.id);
  redirectUrl.searchParams.set("currency", uiCurrency);

  return NextResponse.redirect(redirectUrl);
}
