//home/zyan/Coding/monarxstore/monarxstore/lib/auth.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const AUTH_COOKIE_NAME = "monarx_auth";

const AUTH_SECRET = process.env.AUTH_SECRET || "dev-secret-monarx";

/** Isi token yang kita simpan di cookie */
export type AuthTokenPayload = {
  userId: string;
  email: string;
  name: string;
  isAdmin: boolean;
};


// ===== PASSWORD HELPERS =====

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// ===== TOKEN HELPERS =====

export async function createAuthToken(
  payload: AuthTokenPayload
): Promise<string> {
  return jwt.sign(payload, AUTH_SECRET, {
    expiresIn: "30d",
  });
}

export async function verifyAuthToken(
  token: string
): Promise<AuthTokenPayload> {
  return jwt.verify(token, AUTH_SECRET) as AuthTokenPayload;
}

// lib/auth.ts
import { cookies } from "next/headers";
// ... import lain tetap

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;

  // asumsi kamu punya verifyAuthToken yang balikin AuthTokenPayload
  const payload = await verifyAuthToken(token);

  return {
    id: payload.userId,
    email: payload.email,
    name: payload.name,
    isAdmin: payload.isAdmin,
  };
}