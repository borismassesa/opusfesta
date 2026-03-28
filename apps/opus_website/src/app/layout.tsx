import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import SmoothScrollProvider from '@/components/providers/SmoothScrollProvider'
import './globals.css'

export const metadata: Metadata = {
  title: 'OpusFesta — Plan Your Perfect Wedding',
  description:
    'Everything you need to plan your wedding, all in one place. Discover venues, connect with vendors, manage your registry.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3006'),
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="bg-white" suppressHydrationWarning>
      <body className="bg-white">
        <script dangerouslySetInnerHTML={{ __html: `
          window.addEventListener('error', function(e) {
            document.title = 'JS_ERROR: ' + e.message;
            var d = document.createElement('div');
            d.style.cssText = 'position:fixed;top:0;left:0;right:0;background:red;color:white;padding:16px;z-index:99999;font-size:14px';
            d.textContent = 'JS ERROR: ' + e.message + ' | ' + e.filename + ':' + e.lineno;
            document.body.prepend(d);
          });
          // Native DOM test - bypass React entirely
          document.addEventListener('click', function(e) {
            var el = e.target;
            // Walk up to find the button with aria-label
            while (el && el !== document.body) {
              if (el.getAttribute && el.getAttribute('aria-label') === 'Open menu') {
                alert('NATIVE CLICK WORKS! React hydration may have failed.');
                return;
              }
              el = el.parentElement;
            }
          });
        `}} />
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  )
}
