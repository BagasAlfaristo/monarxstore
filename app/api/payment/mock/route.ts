//home/zyan/Coding/monarxstore/monarxstore/app/api/payment/mock/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  updateOrderStatus,
  type OrderStatus,
} from "../../../../lib/orders";

export async function POST(req: NextRequest) {
  let orderId: string | null = null;
  let status: string | null = null;

  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    // Hit dari backend / Postman pakai JSON
    const body = await req.json().catch(() => null);
    if (body && typeof body.orderId === "string") {
      orderId = body.orderId;
    }
    if (body && typeof body.status === "string") {
      status = body.status;
    }
  } else {
    // Hit dari <form> (form-data)
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

  const normalizedStatus = status.toUpperCase() as OrderStatus;
  if (!["PENDING", "PAID", "FAILED"].includes(normalizedStatus)) {
    return NextResponse.json(
      { error: "Invalid status. Use PENDING | PAID | FAILED" },
      { status: 400 }
    );
  }

  const updated = await updateOrderStatus(orderId, normalizedStatus);

  if (!updated) {
    return NextResponse.json(
      { error: `Order ${orderId} not found` },
      { status: 404 }
    );
  }

  // Kalau request minta JSON (API/backend)
  const accept = req.headers.get("accept") || "";
  if (accept.includes("application/json")) {
    return NextResponse.json({
      ok: true,
      orderId: updated.id,
      status: updated.status,
    });
  }

  // Default: redirect ke admin orders (dipakai dari UI admin)
  const url = new URL(req.url);
  const redirectUrl = new URL("/admin/orders", url.origin);
  return NextResponse.redirect(redirectUrl);
}
