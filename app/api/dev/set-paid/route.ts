// app/api/dev/set-paid/route.ts
import { NextRequest, NextResponse } from "next/server";
import { updateOrderStatus } from "@/lib/orders";

// Pastikan route ini HANYA aktif di development
const IS_DEV = process.env.NODE_ENV !== "production";

export async function GET(req: NextRequest) {
  if (!IS_DEV) {
    return new NextResponse("Not found", { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("id");

  if (!orderId) {
    return NextResponse.json(
      { error: "Missing id query param" },
      { status: 400 }
    );
  }

  try {
    const updated = await updateOrderStatus(orderId, "PAID");
    return NextResponse.json({
      ok: true,
      order: updated,
    });
  } catch (err) {
    console.error("[dev/set-paid] error:", err);
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    );
  }
}
