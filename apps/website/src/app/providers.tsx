"use client";

import { type ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { ContentProvider } from "@/context/ContentContext";
import { CareersContentProvider } from "@/context/CareersContentContext";
import { AuthGateProvider } from "@/context/AuthGateContext";
import { Toaster } from "@/components/ui/toaster";
import { OpusFestaClerkProvider } from "@opusfesta/auth";
import "@/lib/i18n";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <OpusFestaClerkProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <QueryClientProvider client={queryClient}>
          <AuthGateProvider>
            <ContentProvider>
              <CareersContentProvider>
                {children}
                <Toaster />
              </CareersContentProvider>
            </ContentProvider>
          </AuthGateProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </OpusFestaClerkProvider>
  );
}
