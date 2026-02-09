"use client";

import { ClerkProvider as BaseClerkProvider } from "@clerk/nextjs";
import type { ReactNode } from "react";

interface OpusFestaClerkProviderProps {
  children: ReactNode;
}

export function OpusFestaClerkProvider({
  children,
}: OpusFestaClerkProviderProps) {
  return (
    <BaseClerkProvider
      signInUrl="/login"
      signUpUrl="/signup"
      afterSignOutUrl="/login"
    >
      {children}
    </BaseClerkProvider>
  );
}
