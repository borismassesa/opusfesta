import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DM_Sans, Space_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
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
  title: "OpusStudio",
  description: "Capturing life's most defining moments.",
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({
  children,
}: RootLayoutProps) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${dmSans.variable} ${spaceMono.variable} font-sans`}>
        <ClerkProvider
          signInUrl="/portal/login"
          signUpUrl="/portal/signup"
          afterSignOutUrl="/"
        >
          {children as any}
        </ClerkProvider>
      </body>
    </html>
  );
}
