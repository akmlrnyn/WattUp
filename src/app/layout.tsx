import type {
  Metadata,
  Viewport,
} from "next";

import {
  IBM_Plex_Mono,
  IBM_Plex_Sans,
  Manrope,
} from "next/font/google";

import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-display",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  applicationName: "WattUp",

  title: {
    default: "WattUp",
    template: "%s · WattUp",
  },

  description:
    "Cas malam, hemat nyata, grid aman.",

  manifest: "/manifest.webmanifest",

  icons: {
    icon: [
      {
        url: "/icons/wattup-icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icons/wattup-icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],

    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#148c54",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${manrope.variable} ${plexSans.variable} ${plexMono.variable}`}
      >
        {children}
      </body>
    </html>
  );
}