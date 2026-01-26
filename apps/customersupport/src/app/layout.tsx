import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OpusFesta Customer Support",
  description: "Customer support dashboard and chatbot for OpusFesta.",
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
