// app/api/auth/register/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  let email = "";
  let name = "";
  let password = "";

  if (contentType.includes("application/json")) {
    const body = await request.json();
    email = (body.email ?? "").toString().trim().toLowerCase();
    name = (body.name ?? "").toString().trim();
    password = (body.password ?? "").toString();
  } else {
    const formData = await request.formData();
    email = (formData.get("email") ?? "").toString().trim().toLowerCase();
    name = (formData.get("name") ?? "").toString().trim();
    password = (formData.get("password") ?? "").toString();
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
      passwordHash: hashed,   // ⬅️ ini yang benar
      // isAdmin: true, // kalau mau jadikan admin manual
    },
  });

  return NextResponse.json(
    {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    { status: 201 }
  );
}
