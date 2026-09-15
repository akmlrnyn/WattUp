// import "server-only";

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";

import { prisma } from "@/shared/infrastructure/database/prisma";

import { after } from "next/server";

import { sendWattUpVerificationEmail } from "@/shared/infrastructure/email/resend-email";

const betterAuthUrl =
  process.env.BETTER_AUTH_URL;

const googleClientId =
  process.env.GOOGLE_CLIENT_ID;

const googleClientSecret =
  process.env.GOOGLE_CLIENT_SECRET;

if (!betterAuthUrl) {
  throw new Error(
    "BETTER_AUTH_URL is not configured",
  );
}

if (!googleClientId || !googleClientSecret) {
  throw new Error(
    "Google OAuth credentials are not configured",
  );
}

export const auth = betterAuth({
  appName: "WattUp",

  baseURL: betterAuthUrl,

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

emailAndPassword: {
  enabled: true,
  minPasswordLength: 8,

  /*
   * Untuk sekarang session tetap dibuat agar data vehicle
   * bisa disimpan. Akses aplikasi dibatasi melalui layout.
   */
  requireEmailVerification: false,
},

emailVerification: {
  sendOnSignUp: true,
  autoSignInAfterVerification: true,

  sendVerificationEmail: async ({
    user,
    url,
  }) => {
    /*
     * Email dikirim setelah response selesai agar signup
     * tidak menunggu request Resend.
     */
    after(async () => {
      await sendWattUpVerificationEmail({
        name: user.name,
        email: user.email,
        verificationUrl: url,
      });
    });
  },
},

  socialProviders: {
    google: {
      clientId: googleClientId,
      clientSecret: googleClientSecret,

      /*
       * Selalu tampilkan pilihan akun Google.
       */
      prompt: "select_account",
    },
  },

  account: {
    accountLinking: {
      /*
       * Satu user dapat mempunyai credential
       * dan Google account sekaligus.
       */
      enabled: true,

      /*
       * Hanya Google yang dipercaya untuk
       * automatic account linking.
       */
      trustedProviders: ["google"],

      /*
       * Jika email Google sama dengan email user lama,
       * hubungkan ke user tersebut.
       */
      disableImplicitLinking: false,

      /*
       * Jangan pernah menghubungkan dua email berbeda.
       */
      allowDifferentEmails: false,

      /*
       * Nama dan foto WattUp tidak ditimpa otomatis
       * saat Google ditautkan.
       */
      updateUserInfoOnLink: false,
    },
  },

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

    /*
     * Harus menjadi plugin terakhir.
     */
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