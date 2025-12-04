//home/zyan/Coding/monarxstore/monarxstore/app/api/profile/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  AUTH_COOKIE_NAME,
  createAuthToken,
  getCurrentUser,
} from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const name = (formData.get("name") ?? "").toString().trim();

  const updated = await prisma.user.update({
    where: { id: currentUser.id },
    data: {
      name: name || null,
    },
  });

  // Refresh token supaya name di header ikut update
  const token = await createAuthToken({
    userId: updated.id,
    email: updated.email,
    name: updated.name ?? "",
    isAdmin: updated.isAdmin,
  });

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  // Redirect balik ke profile
  return NextResponse.redirect(new URL("/profile?updated=1", request.url));
}
