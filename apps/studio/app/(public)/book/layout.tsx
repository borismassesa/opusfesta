import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Book — OpusFesta Studio',
  description: 'Book your photography and videography session with OpusFesta Studio in Dar es Salaam.',
};

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-bg">
      <header className="border-b-3 border-brand-border bg-brand-dark">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="text-white font-mono font-bold text-lg tracking-wider">
            OPUSFESTA STUDIO
          </a>
          <a
            href="/contact"
            className="text-brand-muted hover:text-white text-sm font-mono transition-colors"
          >
            CONTACT
          </a>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-12">
        {children}
      </main>
      <footer className="border-t-3 border-brand-border bg-white py-6">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-brand-muted text-xs font-mono">
            OpusFesta Studio — Dar es Salaam, Tanzania
          </p>
        </div>
      </footer>
    </div>
  );
}
