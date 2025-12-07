// app/api/admin/items/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { ProductItemType } from "@prisma/client";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const mode = String(formData.get("mode") || "");

  // productId dipakai untuk redirect balik ke produk yang sama
  const productId = formData.get("productId")?.toString() || "";

  // Helper bikin absolute redirect URL
  const makeRedirect = (path: string) => {
    const url = new URL(req.url);
    return NextResponse.redirect(new URL(path, url.origin));
  };

  // CREATE SINGLE
  if (mode === "create") {
    const typeRaw = formData.get("type")?.toString() || "ACCOUNT";
    const value = formData.get("value")?.toString() || "";
    const note = formData.get("note")?.toString() || "";

    if (!productId || !value) {
      return NextResponse.json(
        { error: "Missing productId or value" },
        { status: 400 },
      );
    }

    const type = typeRaw === "CODE" ? "CODE" : "ACCOUNT";

    await prisma.productItem.create({
      data: {
        productId,
        type: type as ProductItemType,
        value,
        note: note || null,
      },
    });

    return makeRedirect(`/admin/items?productId=${productId}`);
  }

  // CREATE BULK
  if (mode === "create-bulk") {
    const typeRaw = formData.get("type")?.toString() || "ACCOUNT";
    const rawText = formData.get("rawText")?.toString() || "";

    if (!productId || !rawText.trim()) {
      return NextResponse.json(
        { error: "Missing productId or rawText" },
        { status: 400 },
      );
    }

    const type = typeRaw === "CODE" ? "CODE" : "ACCOUNT";

    const rows = rawText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (rows.length > 0) {
      await prisma.productItem.createMany({
        data: rows.map((value) => ({
          productId,
          type: type as ProductItemType,
          value,
        })),
      });
    }

    return makeRedirect(`/admin/items?productId=${productId}`);
  }

  // UPDATE (edit value + note)
  if (mode === "update") {
    const id = formData.get("id")?.toString() || "";
    const value = formData.get("value")?.toString() || "";
    const note = formData.get("note")?.toString() || "";

    if (!id) {
      return NextResponse.json(
        { error: "Missing id for update" },
        { status: 400 },
      );
    }

    await prisma.productItem.update({
      where: { id },
      data: {
        value,
        note: note || null,
      },
    });

    if (productId) {
      return makeRedirect(`/admin/items?productId=${productId}`);
    }
    return makeRedirect("/admin/items");
  }

  // DELETE
  if (mode === "delete") {
    const id = formData.get("id")?.toString() || "";

    if (!id) {
      return NextResponse.json(
        { error: "Missing id for delete" },
        { status: 400 },
      );
    }

    await prisma.productItem.delete({
      where: { id },
    });

    if (productId) {
      return makeRedirect(`/admin/items?productId=${productId}`);
    }
    return makeRedirect("/admin/items");
  }

  // Fallback
  return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
}
