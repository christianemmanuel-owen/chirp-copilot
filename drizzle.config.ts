import type { Config } from "drizzle-kit";

export default {
    schema: "./lib/db/schema.ts",
    out: "./migrations",
    dialect: "sqlite",
    driver: "d1-http", // Using d1-http for development/CLI if needed, or just "sqlite" for local
    dbCredentials: {
        accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
        databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
        token: process.env.CLOUDFLARE_D1_TOKEN!,
    },
} satisfies Config;
