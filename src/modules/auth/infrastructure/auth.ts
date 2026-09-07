// import "server-only";

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";

import { prisma } from "@/shared/infrastructure/database/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },

  /*
   * Session disimpan secara aman di encrypted
   * cookie selama lima menit.
   *
   * Navigasi antarrute tidak selalu membutuhkan
   * query session baru ke Supabase.
   */
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
      strategy: "jwe",
    },
  },

  plugins: [
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
    }),

    nextCookies(),
  ],

  advanced: {
    database: {
      joins: true,
    },
  },
});

export type AuthSession =
  typeof auth.$Infer.Session;