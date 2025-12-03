import "dotenv/config";
import { defineConfig } from "@prisma/config";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in .env");
}

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL!,
  },
  migrations: {
    seed: "ts-node ./prisma/seed.ts",
  },
});
