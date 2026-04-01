import { ClerkProvider } from "@clerk/nextjs";
import type { ReactNode } from "react";

type AuthLayoutProps = {
  children: ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return <ClerkProvider>{children as any}</ClerkProvider>;
}
