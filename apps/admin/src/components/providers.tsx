'use client';

import { ThemeProvider } from 'next-themes';
import { ContentProvider } from '@/context/ContentContext';
import { ToastProvider } from '@/components/ui/toast';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ContentProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </ContentProvider>
    </ThemeProvider>
  );
}
