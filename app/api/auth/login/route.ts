//home/zyan/Coding/monarxstore/monarxstore/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  AUTH_COOKIE_NAME,
  createAuthToken,
  verifyPassword,
} from "@/lib/auth";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  let email = "";
  let password = "";
  let redirectPath = "";

  if (contentType.includes("application/json")) {
    const body = await request.json();
    email = (body.email ?? "").toString().trim().toLowerCase();
    password = (body.password ?? "").toString();
    redirectPath = (body.redirect ?? "").toString();
  } else {
    const formData = await request.formData();
    email = (formData.get("email") ?? "").toString().trim().toLowerCase();
    password = (formData.get("password") ?? "").toString();
    redirectPath = (formData.get("redirect") ?? "").toString();
  }

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email & password wajib diisi" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json(
      { error: "Email atau password salah" },
      { status: 401 }
    );
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    return NextResponse.json(
      { error: "Email atau password salah" },
      { status: 401 }
    );
  }

  const token = await createAuthToken({
    userId: user.id,
    email: user.email,
    name: user.name ?? "",
    isAdmin: user.isAdmin,
  });


  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  // sanitize redirect supaya nggak bisa ke domain luar
  const url = new URL(request.url);
  const safeRedirect =
    redirectPath &&
    redirectPath.startsWith("/") &&
    !redirectPath.startsWith("//")
      ? redirectPath
      : "";

  let redirectTo = "/";

  if (safeRedirect) {
    redirectTo = safeRedirect;
  }

  // admin tetap diarahkan ke panel admin
  if (user.isAdmin) {
    redirectTo = "/admin/products";
  }

  return NextResponse.redirect(new URL(redirectTo, url));
}

