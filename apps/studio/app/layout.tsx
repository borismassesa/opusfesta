import type { Metadata } from "next";
import { DM_Sans, Space_Mono } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-sans",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "OpusFesta Studio | Cinematic Wedding & Event Visuals",
  description: "Cinematic wedding films, event photography, and premium brand visuals by OpusFesta Studio.",
  metadataBase: new URL("https://studio.opusfesta.com"),
  openGraph: {
    title: "OpusFesta Studio | Cinematic Wedding & Event Visuals",
    description: "Cinematic wedding films, event photography, and premium brand visuals by OpusFesta Studio.",
    type: "website",
    url: "/",
    siteName: "OpusFesta Studio",
  },
  twitter: {
    card: "summary_large_image",
    title: "OpusFesta Studio",
    description: "Cinematic wedding films, event photography, and premium brand visuals.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${dmSans.variable} ${spaceMono.variable} font-sans`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[150] focus:px-4 focus:py-3 focus:bg-brand-dark focus:text-white focus:border-2 focus:border-brand-accent"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
