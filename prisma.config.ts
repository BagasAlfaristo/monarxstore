// prisma.config.ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  // lokasi schema
  schema: "prisma/schema.prisma",

  // optional, biar prisma db seed jalan
  migrations: {
    path: "prisma/migrations",
    seed: "ts-node ./prisma/seed.ts",
  },

  // URL DB ambil dari env, lewat helper env()
  datasource: {
    url: env("DATABASE_URL"),
  },
});
