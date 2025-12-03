// app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "../../../lib/orders";

export async function POST(request: NextRequest) {
  const formData = await request.formData();

  const productSlug = formData.get("productSlug");
  const email = formData.get("email");
  const notes = formData.get("notes");

  if (typeof productSlug !== "string" || typeof email !== "string") {
    return new NextResponse("Invalid payload", { status: 400 });
  }

  const order = await createOrder({
    productSlug,
    email,
    notes: typeof notes === "string" ? notes : undefined,
  });

  const url = new URL(request.url);
  const redirectUrl = new URL(
    `/order-success?orderId=${encodeURIComponent(order.id)}`,
    url.origin
  );

  return NextResponse.redirect(redirectUrl);
}
