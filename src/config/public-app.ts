export const publicAppConfig = {
  name: "WattUp",

  url:
    process.env.NEXT_PUBLIC_APP_URL ??
    "https://wattup.vercel.app",

  supportEmail:
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL ??
    "akmalranyan@gmail.com",

  lastUpdated: "14 September 2026",
} as const;