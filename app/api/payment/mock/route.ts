// app/api/payment/mock/route.ts
import { NextRequest, NextResponse } from "next/server";
import { updateOrderStatus } from "../../../../lib/orders";

export async function POST(req: NextRequest) {
  let orderId: string | null = null;
  let status: string | null = null;

  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const body = await req.json().catch(() => null);
    if (body && typeof body.orderId === "string") {
      orderId = body.orderId;
    }
    if (body && typeof body.status === "string") {
      status = body.status;
    }
  } else {
    const formData = await req.formData();
    const oid = formData.get("orderId");
    const st = formData.get("status");
    if (typeof oid === "string") orderId = oid;
    if (typeof st === "string") status = st;
  }

  if (!orderId || !status) {
    return NextResponse.json(
      { error: "orderId and status are required" },
      { status: 400 }
    );
  }

  const normalizedStatus = status.toUpperCase();
  if (!["PENDING", "PAID", "FAILED"].includes(normalizedStatus)) {
    return NextResponse.json(
      { error: "Invalid status. Use PENDING | PAID | FAILED" },
      { status: 400 }
    );
  }

  const updated = await updateOrderStatus(
    orderId,
    normalizedStatus as any
  );

  if (!updated) {
    return NextResponse.json(
      { error: `Order ${orderId} not found` },
      { status: 404 }
    );
  }

  const accept = req.headers.get("accept") || "";
  if (accept.includes("application/json")) {
    return NextResponse.json({
      ok: true,
      orderId: updated.id,
      status: updated.status,
    });
  }

  const url = new URL(req.url);
  const redirectUrl = new URL("/admin/orders", url.origin);
  return NextResponse.redirect(redirectUrl);
}
