import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/app/globals.css";
import { Providers } from "@/app/providers";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://thefestaevents.com",
  ),
  title: "THE FESTA | Plan Your Perfect Wedding",
  description:
    "The all-in-one marketplace for venues, vendors, and planning tools. Discover inspiration and manage every detail in one place.",
  openGraph: {
    title: "THE FESTA | Plan Your Perfect Wedding",
    description:
      "The all-in-one marketplace for venues, vendors, and planning tools. Discover inspiration and manage every detail in one place.",
    type: "website",
    url: "https://thefestaevents.com",
    siteName: "THE FESTA",
    images: [
      {
        url: "/opengraph.png",
        width: 765,
        height: 259,
        alt: "THE FESTA - Plan Your Perfect Wedding",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "THE FESTA | Plan Your Perfect Wedding",
    description:
      "The all-in-one marketplace for venues, vendors, and planning tools. Discover inspiration and manage every detail in one place.",
    images: ["/opengraph.png"],
    creator: "@thefesta",
  },
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "any", type: "image/png" },
    ],
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400&family=Pacifico&family=Sacramento&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
