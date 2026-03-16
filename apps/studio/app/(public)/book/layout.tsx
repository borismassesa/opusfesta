import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Book — OpusStudio',
  description: 'Book your photography and videography session with OpusStudio in Dar es Salaam.',
};

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      <header className="border-b-3 border-brand-border bg-brand-dark">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-white font-mono font-bold text-lg tracking-wider hover:text-brand-accent transition-colors">
            OpusStudio
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/contact"
              className="text-brand-muted hover:text-white text-xs font-mono uppercase tracking-wider transition-colors hidden sm:block"
            >
              Contact
            </Link>
            <Link
              href="/"
              className="text-brand-muted hover:text-white text-xs font-mono uppercase tracking-wider transition-colors"
            >
              Home
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10 sm:py-14">
        {children}
      </main>
      <footer className="border-t-3 border-brand-border bg-white py-6">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-brand-muted text-xs font-mono">
            OpusStudio — Dar es Salaam, Tanzania
          </p>
          <p className="text-brand-muted/60 text-[10px] font-mono">
            Your slot is reserved for 15 minutes after selection
          </p>
        </div>
      </footer>
    </div>
  );
}
