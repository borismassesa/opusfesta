"use client";

import { ClerkProvider as BaseClerkProvider } from "@clerk/nextjs";
import type { ReactNode } from "react";

interface OpusFestaClerkProviderProps {
  children: ReactNode;
}

export function OpusFestaClerkProvider({
  children,
}: OpusFestaClerkProviderProps) {
  // During build-time prerendering, the publishable key may not be available.
  // Skip Clerk wrapping to allow static pages (like /_not-found) to build.
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return <>{children}</>;
  }

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
