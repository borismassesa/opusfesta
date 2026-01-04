import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import { ConditionalVendorLayout } from '@/components/layout/conditional-vendor-layout';

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=General+Sans:wght@400;500;600;700&family=Pacifico&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          <ConditionalVendorLayout>{children}</ConditionalVendorLayout>
        </Providers>
      </body>
    </html>
  );
}
