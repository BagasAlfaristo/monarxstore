import { NextRequest, NextResponse } from "next/server";
import {
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/products";
import { getCurrentUser } from "@/lib/auth";

type AdminMode = "create" | "update" | "delete";

function getMode(formData: FormData): AdminMode | null {
  const raw = formData.get("mode");
  if (raw === "create" || raw === "update" || raw === "delete") {
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

function getNumber(formData: FormData, key: string): number | undefined {
  const v = getString(formData, key);
  if (v === undefined) return undefined;
  const num = Number(v);
  if (Number.isNaN(num)) return undefined;
  return num;
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
  const baseRedirectUrl = new URL("/admin/products", url.origin);

  const formData = await req.formData();
  const mode = getMode(formData);

  if (!mode) {
    const redirectUrl = new URL(baseRedirectUrl);
    redirectUrl.searchParams.set("error", "invalid_mode");
    return NextResponse.redirect(redirectUrl.toString(), { status: 303 });
  }

  try {
    if (mode === "create") {
      const name = getString(formData, "name");
      const slug = getString(formData, "slug");
      const description = getString(formData, "description") ?? "";
      const price = getNumber(formData, "price");
      const currency = getString(formData, "currency") ?? "USD";
      const imageUrl = getString(formData, "imageUrl") ?? "";
      const featured = getBoolean(formData, "featured") ?? false;

      if (!name || !slug || price === undefined) {
        const redirectUrl = new URL(baseRedirectUrl);
        redirectUrl.searchParams.set("error", "missing_fields");
        return NextResponse.redirect(redirectUrl.toString(), { status: 303 });
      }

      await createProduct({
        name,
        slug,
        description,
        price,
        currency,
        imageUrl,
        featured,
      });
    }

    if (mode === "update") {
      const id = getString(formData, "id");
      if (!id) {
        const redirectUrl = new URL(baseRedirectUrl);
        redirectUrl.searchParams.set("error", "missing_id");
        return NextResponse.redirect(redirectUrl.toString(), { status: 303 });
      }

      const data: Parameters<typeof updateProduct>[1] = {};

      const name = getString(formData, "name");
      if (name !== undefined) data.name = name;

      const slug = getString(formData, "slug");
      if (slug !== undefined) data.slug = slug;

      const description = getString(formData, "description");
      if (description !== undefined) data.description = description;

      const price = getNumber(formData, "price");
      if (price !== undefined) data.price = price;

      const currency = getString(formData, "currency");
      if (currency !== undefined) data.currency = currency;

      const imageUrl = getString(formData, "imageUrl");
      if (imageUrl !== undefined) data.imageUrl = imageUrl;

      // ⬇️ perbedaan di sini
      const featured = getBoolean(formData, "featured") ?? false;
      data.featured = featured;

      await updateProduct(id, data);
    }

    if (mode === "delete") {
      const id = getString(formData, "id");
      if (!id) {
        const redirectUrl = new URL(baseRedirectUrl);
        redirectUrl.searchParams.set("error", "missing_id");
        return NextResponse.redirect(redirectUrl.toString(), { status: 303 });
      }

      await deleteProduct(id);
    }

    const redirectUrl = new URL(baseRedirectUrl);
    redirectUrl.searchParams.set("success", mode);
    return NextResponse.redirect(redirectUrl.toString(), { status: 303 });
  } catch (err: any) {
    console.error("[/api/admin/products] error", err);

    const redirectUrl = new URL(baseRedirectUrl);

    if (err && typeof err === "object" && err.code === "P2002") {
      redirectUrl.searchParams.set("error", "slug_taken");
    } else {
      redirectUrl.searchParams.set("error", "unknown");
    }

    return NextResponse.redirect(redirectUrl.toString(), { status: 303 });
  }
}
