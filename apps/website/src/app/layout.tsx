import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'TheFesta | Intelligent Wedding Ecosystem',
  description:
    'A modern suite of planning tools, curated vendors, and stunning wedding websites crafted for inclusive celebrations.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-[#FAFAFA] text-slate-900 selection:bg-rose-500/20 selection:text-rose-900 dark:bg-[#0f1116] dark:text-slate-200">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
