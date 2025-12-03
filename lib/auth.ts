// lib/auth.ts
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "./prisma";

const AUTH_COOKIE_NAME = "monarx_session";

function getAuthSecretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createAuthToken(payload: {
  userId: string;
  email: string;
  isAdmin: boolean;
}) {
  const key = getAuthSecretKey();
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(key);
}

export async function verifyAuthToken(token: string) {
  const key = getAuthSecretKey();
  const { payload } = await jwtVerify(token, key);
  return payload as {
    userId: string;
    email: string;
    isAdmin: boolean;
    iat: number;
    exp: number;
  };
}

// OPTIONAL: helper getCurrentUser utk dipakai di server components
export async function getCurrentUserFromToken(token: string) {
  const payload = await verifyAuthToken(token);
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });
  return user;
}

export { AUTH_COOKIE_NAME };
