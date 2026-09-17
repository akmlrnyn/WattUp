import type { MetadataRoute } from "next";

import { publicAppConfig } from "@/config/public-app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: [
        "/",
        "/privacy",
        "/terms",
        "/data-deletion",
      ],
      disallow: [
        "/admin",
        "/api",
        "/auth",
        "/challenge",
        "/dashboard",
        "/leaderboard",
        "/onboarding",
        "/sessions",
        "/sign-in",
        "/sign-up",
        "/verify-email",
      ],
    },
    sitemap: new URL(
      "/sitemap.xml",
      publicAppConfig.url,
    ).toString(),
  };
}
