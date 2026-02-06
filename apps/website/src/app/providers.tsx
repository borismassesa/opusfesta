"use client";

import { type ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { ContentProvider } from "@/context/ContentContext";
import { CareersContentProvider } from "@/context/CareersContentContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import "@/lib/i18n";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ContentProvider>
            <CareersContentProvider>
              {children}
              <Toaster />
            </CareersContentProvider>
          </ContentProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
