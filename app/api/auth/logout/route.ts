//home/zyan/Coding/monarxstore/monarxstore/app/api/auth/logout/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);

  // balikin ke home
  return NextResponse.redirect(new URL("/", request.url));
}
