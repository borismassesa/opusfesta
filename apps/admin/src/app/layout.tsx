import type { Metadata } from "next";
import { OpusFestaClerkProvider } from "@opusfesta/auth";
import ClientLayoutContent from "./ClientLayoutContent";
import "./globals.css";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
  (process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : "https://admin.opusfestaevents.com");

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "OpusFesta Admin Portal",
    template: "%s | OpusFesta Admin",
  },
  description: "Manage your OpusFesta platform - vendors, bookings, content, and more.",
  keywords: ["OpusFesta", "Admin", "Wedding Planning", "Event Management"],
  authors: [{ name: "OpusFesta Team" }],
  creator: "OpusFesta",
  publisher: "OpusFesta",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "OpusFesta Admin Portal",
    title: "OpusFesta Admin Portal",
    description: "Manage your OpusFesta platform - vendors, bookings, content, and more.",
    images: [
      {
        url: "/opengraph-admin.png",
        width: 1200,
        height: 630,
        alt: "OpusFesta Admin Portal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OpusFesta Admin Portal",
    description: "Manage your OpusFesta platform - vendors, bookings, content, and more.",
    images: ["/opengraph-admin.png"],
    creator: "@opusfesta",
  },
  robots: {
    index: false, // Admin portal should not be indexed
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
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
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=General+Sans:wght@400;500;600;700&family=Pacifico&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <OpusFestaClerkProvider>
          <ClientLayoutContent>{children}</ClientLayoutContent>
        </OpusFestaClerkProvider>
      </body>
    </html>
  );
}
