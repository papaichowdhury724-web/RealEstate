import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import "./walkthrough.css";
import { getConfig } from "@/lib/store";
import { fillTokens } from "@/lib/tokens";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const cfg = await getConfig();
  return {
    title: fillTokens(cfg.site.seoTitle, cfg),
    description: fillTokens(cfg.site.seoDescription, cfg),
    icons: cfg.site.faviconUrl ? { icon: cfg.site.faviconUrl } : undefined,
    openGraph: { title: fillTokens(cfg.site.seoTitle, cfg), description: fillTokens(cfg.site.seoDescription, cfg), locale: "en_IN", type: "website" },
  };
}

export const viewport: Viewport = { themeColor: "#08080b", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preconnect" href="https://images.pexels.com" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
