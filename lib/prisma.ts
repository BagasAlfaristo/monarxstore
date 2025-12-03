// lib/prisma.ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "pg";

const { Pool } = pkg;

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

// Pool Postgres pakai DATABASE_URL dari .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ["warn", "error"], // boleh tambah "query" kalau mau debug
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
