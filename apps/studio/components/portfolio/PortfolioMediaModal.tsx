'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { PortfolioItem } from '@/lib/data';
import { toDisplayDate } from '@/lib/portfolio';
import PortfolioMediaRenderer from '@/components/portfolio/PortfolioMediaRenderer';

interface PortfolioMediaModalProps {
  item: PortfolioItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PortfolioMediaModal({ item, isOpen, onClose }: PortfolioMediaModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    setZoomed(false);
  }, [item]);

  useEffect(() => {
    if (!isOpen || !modalRef.current) return;
    previousFocusRef.current = document.activeElement as HTMLElement | null;

    const selector =
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusable = modalRef.current.querySelectorAll<HTMLElement>(selector);
    if (focusable.length) focusable[0].focus();

    const trap = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !modalRef.current) return;
      const nodes = modalRef.current.querySelectorAll<HTMLElement>(selector);
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', trap);
    return () => {
      document.removeEventListener('keydown', trap);
      previousFocusRef.current?.focus();
    };
  }, [isOpen]);

  if (!isOpen || !item) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/85 p-4 sm:p-8"
      role="presentation"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="portfolio-modal-title"
        className="grid max-h-[90vh] w-full max-w-6xl grid-cols-1 overflow-hidden border-4 border-brand-border bg-brand-bg lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative min-h-[280px] border-b-4 border-brand-border bg-black lg:border-b-0 lg:border-r-4">
          <PortfolioMediaRenderer item={item} zoomed={zoomed} onToggleZoom={() => setZoomed((prev) => !prev)} />
          {item.type === 'image' && (
            <button
              type="button"
              onClick={() => setZoomed((prev) => !prev)}
              className="absolute left-4 top-4 border-2 border-white/40 bg-black/60 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white hover:border-brand-accent"
            >
              {zoomed ? 'Zoom Out' : 'Zoom In'}
            </button>
          )}
        </div>

        <div className="flex max-h-[90vh] flex-col">
          <div className="flex items-center justify-between border-b-4 border-brand-border px-5 py-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-brand-accent">Preview</span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close media preview"
              className="inline-flex h-10 w-10 items-center justify-center border-2 border-brand-border text-brand-dark transition-colors hover:border-brand-accent hover:text-brand-accent"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-5 overflow-y-auto px-5 py-6">
            <div>
              <p className="mb-2 text-[10px] font-mono uppercase tracking-widest text-brand-muted">{item.category}</p>
              <h2 id="portfolio-modal-title" className="text-3xl font-bold uppercase tracking-tight text-brand-dark">
                {item.title}
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-neutral-600">{item.description}</p>
            <div className="text-[10px] font-mono uppercase tracking-widest text-brand-muted">{toDisplayDate(item.date)}</div>
            {item.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <span key={tag} className="border-2 border-brand-border px-2 py-1 text-[10px] font-mono uppercase tracking-widest text-brand-dark">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="mt-auto border-t-4 border-brand-border p-5">
            <Link
              href={`/portfolio/${item.slug}`}
              className="inline-flex items-center gap-2 border-2 border-brand-dark bg-brand-dark px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white shadow-brutal-sm transition-all hover:translate-x-1 hover:translate-y-1 hover:border-brand-accent hover:bg-brand-accent hover:shadow-none"
            >
              Open Full Case Study
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
