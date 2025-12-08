// app/api/admin/product-items/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  createProductItemsFromLines,
  deleteProductItem,
  markProductItemUsed,
} from "@/lib/productItems";
import type { ProductItemType } from "@prisma/client";

type Mode = "create_bulk" | "delete" | "toggle_used";

function getMode(formData: FormData): Mode | null {
  const raw = formData.get("mode");
  if (raw === "create_bulk" || raw === "delete" || raw === "toggle_used") {
    return raw;
  }
  return null;
}

function getString(formData: FormData, key: string): string | undefined {
  const v = formData.get(key);
  if (typeof v !== "string") return undefined;
  const trimmed = v.trim();
  return trimmed === "" ? undefined : trimmed;
}

function getBoolean(formData: FormData, key: string): boolean | undefined {
  const v = formData.get(key);
  if (typeof v !== "string") return undefined;
  if (v === "true") return true;
  if (v === "false") return false;
  return undefined;
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !user.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const baseRedirectUrl = new URL("/admin/product-items", url.origin);

  const formData = await req.formData();
  const mode = getMode(formData);

  if (!mode) {
    const redirectUrl = new URL(baseRedirectUrl);
    redirectUrl.searchParams.set("error", "invalid_mode");
    return NextResponse.redirect(redirectUrl.toString(), { status: 303 });
  }

  try {
    if (mode === "create_bulk") {
      const productId = getString(formData, "productId");
      const typeRaw = getString(formData, "type");
      const lines = getString(formData, "lines");

      if (!productId || !typeRaw || !lines) {
        const redirectUrl = new URL(baseRedirectUrl);
        redirectUrl.searchParams.set("error", "missing_fields");
        return NextResponse.redirect(redirectUrl.toString(), { status: 303 });
      }

      const type = typeRaw as ProductItemType;
      if (type !== "ACCOUNT" && type !== "CODE") {
        const redirectUrl = new URL(baseRedirectUrl);
        redirectUrl.searchParams.set("error", "invalid_type");
        return NextResponse.redirect(redirectUrl.toString(), { status: 303 });
      }

      const created = await createProductItemsFromLines({
        productId,
        type,
        rawLines: lines,
      });

      const redirectUrl = new URL(baseRedirectUrl);
      redirectUrl.searchParams.set("success", created > 0 ? "created" : "nothing");
      redirectUrl.searchParams.set("productId", productId);
      return NextResponse.redirect(redirectUrl.toString(), { status: 303 });
    }

    if (mode === "delete") {
      const id = getString(formData, "id");
      const productId = getString(formData, "productId");

      if (!id) {
        const redirectUrl = new URL(baseRedirectUrl);
        redirectUrl.searchParams.set("error", "missing_id");
        return NextResponse.redirect(redirectUrl.toString(), { status: 303 });
      }

      await deleteProductItem(id);

      const redirectUrl = new URL(baseRedirectUrl);
      redirectUrl.searchParams.set("success", "deleted");
      if (productId) redirectUrl.searchParams.set("productId", productId);
      return NextResponse.redirect(redirectUrl.toString(), { status: 303 });
    }

    if (mode === "toggle_used") {
      const id = getString(formData, "id");
      const productId = getString(formData, "productId");
      const isUsedRaw = getBoolean(formData, "isUsed");

      if (!id || isUsedRaw === undefined) {
        const redirectUrl = new URL(baseRedirectUrl);
        redirectUrl.searchParams.set("error", "missing_id");
        return NextResponse.redirect(redirectUrl.toString(), { status: 303 });
      }

      await markProductItemUsed({ id, isUsed: isUsedRaw });

      const redirectUrl = new URL(baseRedirectUrl);
      redirectUrl.searchParams.set("success", "toggled");
      if (productId) redirectUrl.searchParams.set("productId", productId);
      return NextResponse.redirect(redirectUrl.toString(), { status: 303 });
    }

    // fallback (shouldn't reach)
    const redirectUrl = new URL(baseRedirectUrl);
    redirectUrl.searchParams.set("error", "unknown");
    return NextResponse.redirect(redirectUrl.toString(), { status: 303 });
  } catch (err) {
    console.error("[/api/admin/product-items] error", err);
    const redirectUrl = new URL(baseRedirectUrl);
    redirectUrl.searchParams.set("error", "unknown");
    return NextResponse.redirect(redirectUrl.toString(), { status: 303 });
  }
}
