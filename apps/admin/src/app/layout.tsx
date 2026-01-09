import type { Metadata } from "next";
import ClientLayoutContent from "./ClientLayoutContent";
import "./globals.css";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
  (process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : "https://admin.thefestaevents.com");

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "TheFesta Admin Portal",
    template: "%s | TheFesta Admin",
  },
  description: "Manage your TheFesta platform - vendors, bookings, content, and more.",
  keywords: ["TheFesta", "Admin", "Wedding Planning", "Event Management"],
  authors: [{ name: "TheFesta Team" }],
  creator: "TheFesta",
  publisher: "TheFesta",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "TheFesta Admin Portal",
    title: "TheFesta Admin Portal",
    description: "Manage your TheFesta platform - vendors, bookings, content, and more.",
    images: [
      {
        url: "/opengraph-admin.png",
        width: 1200,
        height: 630,
        alt: "TheFesta Admin Portal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TheFesta Admin Portal",
    description: "Manage your TheFesta platform - vendors, bookings, content, and more.",
    images: ["/opengraph-admin.png"],
    creator: "@thefesta",
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
        <ClientLayoutContent>{children}</ClientLayoutContent>
      </body>
    </html>
  );
}
