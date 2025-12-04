//home/zyan/Coding/monarxstore/monarxstore/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  let email = "";
  let password = "";
  let name = "";

  if (contentType.includes("application/json")) {
    const body = await request.json();
    email = (body.email ?? "").toString().trim().toLowerCase();
    password = (body.password ?? "").toString();
    name = (body.name ?? "").toString().trim();
  } else {
    const formData = await request.formData();
    email = (formData.get("email") ?? "").toString().trim().toLowerCase();
    password = (formData.get("password") ?? "").toString();
    name = (formData.get("name") ?? "").toString().trim();
  }

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email & password wajib diisi" },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Email sudah terdaftar" },
      { status: 409 }
    );
  }

  const hashed = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      name: name || null,
      passwordHash: hashed,
    },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  // Cek apakah client ingin JSON (misalnya fetch dari JS)
  const accept = request.headers.get("accept") ?? "";
  const wantsJson = accept.includes("application/json");

  if (wantsJson) {
    // dipakai kalau nanti kamu mau panggil dari frontend via fetch()
    return NextResponse.json(user);
  }

  // default: redirect ke halaman login untuk form biasa
  const redirectUrl = new URL("/login?registered=1", request.url);
  return NextResponse.redirect(redirectUrl);
}
