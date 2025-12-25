// lib/auth.ts
import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { Pool } from "pg";
import { PostgresDialect } from "kysely";

// ❌ УДАЛИТЕ этот импорт - он не нужен в auth.ts
// import { db } from './db';

if (!process.env.BETTER_AUTH_SECRET) {
  console.warn('BETTER_AUTH_SECRET is not set. Using a default value in development.');
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in environment variables');
}

// Используем dialect из db, если доступен
// или создаем отдельный
const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
  }),
});

export const auth = betterAuth({
  database: {
    dialect, // Передаем созданный dialect
    type: "postgres",
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.NEXTAUTH_URL || "http://localhost:3000",
  trustedOrigins: [
    "http://localhost",
    "http://localhost:80",
    "http://localhost:3000",
    "http://127.0.0.1",
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost",
  ],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 24 hours
  },
  plugins: [
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
    })
  ],
});

