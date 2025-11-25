import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { Inter, JetBrains_Mono, Pacifico } from 'next/font/google';
import { Providers } from './providers';

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const display = Pacifico({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400'],
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TheFesta | Intelligent Wedding Ecosystem',
  description:
    'A modern suite of planning tools, curated vendors, and stunning wedding websites crafted for inclusive celebrations.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable} ${mono.variable}`} suppressHydrationWarning>
      <body className="bg-[#FAFAFA] text-slate-900 selection:bg-rose-500/20 selection:text-rose-900 dark:bg-[#0f1116] dark:text-slate-200">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
