// app/api/admin/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

type AdminMode = "create" | "update" | "delete";

function getMode(formData: FormData): AdminMode | null {
  const raw = formData.get("mode");
  if (raw === "create" || raw === "update" || raw === "delete") {
    return raw;
  }
  return null;
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const mode = getMode(formData);

  if (!mode) {
    return NextResponse.json(
      { error: "Invalid mode" },
      { status: 400 }
    );
  }

  try {
    if (mode === "create") {
      const slug = formData.get("slug");
      const name = formData.get("name");
      const description = formData.get("description");
      const priceRaw = formData.get("price");
      const stockRaw = formData.get("stock");
      const imageUrl = formData.get("imageUrl");
      const featuredRaw = formData.get("featured");

      if (
        typeof slug !== "string" ||
        typeof name !== "string" ||
        typeof description !== "string" ||
        typeof priceRaw !== "string" ||
        typeof stockRaw !== "string" ||
        typeof imageUrl !== "string"
      ) {
        return NextResponse.json(
          { error: "Missing or invalid fields" },
          { status: 400 }
        );
      }

      const price = Number(priceRaw);
      const stock = Number(stockRaw);

      if (!Number.isFinite(price) || !Number.isFinite(stock)) {
        return NextResponse.json(
          { error: "Price and stock must be numeric" },
          { status: 400 }
        );
      }

      const featured = featuredRaw != null;

      await prisma.product.create({
        data: {
          slug,
          name,
          description,
          price: Math.round(price),
          currency: "IDR",
          stock: Math.round(stock),
          imageUrl,
          featured,
        },
      });
    }

    if (mode === "update") {
      const id = formData.get("id");
      if (typeof id !== "string" || !id) {
        return NextResponse.json(
          { error: "Missing product id" },
          { status: 400 }
        );
      }

      const priceRaw = formData.get("price");
      const stockRaw = formData.get("stock");
      const featuredValue = formData.get("featuredValue");

      const data: {
        price?: number;
        stock?: number;
        featured?: boolean;
      } = {};

      if (typeof priceRaw === "string" && priceRaw !== "") {
        const price = Number(priceRaw);
        if (!Number.isFinite(price)) {
          return NextResponse.json(
            { error: "Price must be numeric" },
            { status: 400 }
          );
        }
        data.price = Math.round(price);
      }

      if (typeof stockRaw === "string" && stockRaw !== "") {
        const stock = Number(stockRaw);
        if (!Number.isFinite(stock)) {
          return NextResponse.json(
            { error: "Stock must be numeric" },
            { status: 400 }
          );
        }
        data.stock = Math.round(stock);
      }

      if (typeof featuredValue === "string") {
        data.featured = featuredValue === "true";
      }

      if (Object.keys(data).length === 0) {
        // tidak ada perubahan, langsung redirect saja
      } else {
        await prisma.product.update({
          where: { id },
          data,
        });
      }
    }

    if (mode === "delete") {
      const id = formData.get("id");
      if (typeof id !== "string" || !id) {
        return NextResponse.json(
          { error: "Missing product id" },
          { status: 400 }
        );
      }

      await prisma.product.delete({
        where: { id },
      });
    }

    // Sukses -> redirect balik ke /admin/products
    const url = new URL(req.url);
    const redirectUrl = new URL("/admin/products", url.origin);
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("Admin products error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
