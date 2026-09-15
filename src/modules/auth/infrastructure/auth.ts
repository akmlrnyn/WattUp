// import "server-only";

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";

import { prisma } from "@/shared/infrastructure/database/prisma";
import { sendWattUpVerificationEmail } from "@/shared/infrastructure/email/resend-email";

const betterAuthUrl =
  process.env.BETTER_AUTH_URL;

const googleClientId =
  process.env.GOOGLE_CLIENT_ID;

const googleClientSecret =
  process.env.GOOGLE_CLIENT_SECRET;

const betterAuthSecret =
  process.env.BETTER_AUTH_SECRET;

if (!betterAuthUrl) {
  throw new Error(
    "BETTER_AUTH_URL is not configured",
  );
}

if (
  !googleClientId ||
  !googleClientSecret
) {
  throw new Error(
    "Google OAuth credentials are not configured",
  );
}

if (!betterAuthSecret) {
  throw new Error(
    "BETTER_AUTH_SECRET is not configured",
  );
}

export const auth = betterAuth({
  appName: "WattUp",

  baseURL: betterAuthUrl,
  secret: betterAuthSecret,

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,

    /*
     * Session signup dipertahankan agar halaman verifikasi
     * dapat mengetahui alamat email user.
     *
     * Onboarding, dashboard, dan API tetap dibatasi
     * oleh guard aplikasi berdasarkan emailVerified.
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
       * Untuk tahap local testing/pilot, tunggu hasil Resend.
       * Dengan begitu UI hanya menampilkan sukses jika
       * Resend benar-benar menerima email tersebut.
       */
      await sendWattUpVerificationEmail({
        name: user.name,
        email: user.email,
        verificationUrl: url,
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
       * Satu user dapat memiliki credential email/password
       * dan akun Google sekaligus.
       */
      enabled: true,

      /*
       * Google memberikan status verifikasi email.
       * Akun lama dengan email yang sama dapat ditautkan.
       */
      disableImplicitLinking: false,

      /*
       * Jangan hubungkan dua alamat email berbeda.
       */
      allowDifferentEmails: false,

      /*
       * Nama dan foto WattUp tidak otomatis ditimpa
       * ketika akun Google ditautkan.
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