import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import { ThemeProvider } from 'next-themes';

export const metadata: Metadata = {
  title: 'The Festa - Vendor Portal',
  description: 'Manage your wedding and event services with The Festa',
};

export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            {children}
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
