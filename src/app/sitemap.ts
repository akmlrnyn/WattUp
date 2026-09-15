import type { MetadataRoute } from "next";

import { publicAppConfig } from "@/config/public-app";

const publicRoutes = [
  "/about",
  "/privacy",
  "/terms",
  "/data-deletion",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.map((route) => ({
    url: new URL(
      route,
      publicAppConfig.url,
    ).toString(),
    lastModified: new Date(
      "2026-09-14T00:00:00.000Z",
    ),
    changeFrequency:
      route === "/about"
        ? "monthly"
        : "yearly",
    priority:
      route === "/about"
        ? 1
        : 0.7,
  }));
}
