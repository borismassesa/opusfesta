import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OpusFesta Studio",
  description:
    "Photography, videography, and cinematography studio for weddings, events, and brand storytelling.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
