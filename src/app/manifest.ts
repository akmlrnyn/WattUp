import type { MetadataRoute } from "next";

export default function manifest():
  MetadataRoute.Manifest {
  return {
    name: "WattUp · #ShiftMalam Challenge",
    short_name: "WattUp",

    description:
      "Cas malam, hemat nyata, grid aman.",

    start_url: "/dashboard",

    display: "standalone",

    background_color: "#f2f8f5",
    theme_color: "#148c54",

    orientation: "portrait-primary",

    icons: [
      {
        src: "/icons/wattup-icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/wattup-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/wattup-icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}