'use client';

import { useEffect, useRef } from "react";
import BookingForm from "@/components/booking/BookingForm";

type BookingModalProps = {
  isOpen: boolean;
  source: string;
  presetEventType?: string;
  onClose: () => void;
};

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export default function BookingModal({ isOpen, source, presetEventType, onClose }: BookingModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusedRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previousFocusedRef.current = document.activeElement;
    const bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? [];
    if (focusable.length > 0) focusable[0].focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;

      const elements = dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (elements.length === 0) return;

      const first = elements[0];
      const last = elements[elements.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = bodyOverflow;
      if (previousFocusedRef.current instanceof HTMLElement) {
        previousFocusedRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        aria-label="Close booking modal backdrop"
        onClick={onClose}
        className="absolute inset-0 bg-brand-dark/80 backdrop-blur-sm"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-modal-title"
        className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto border-4 border-brand-border bg-brand-bg shadow-brutal"
      >
        <div className="sticky top-0 z-10 bg-brand-bg border-b-4 border-brand-border px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-mono text-brand-accent uppercase tracking-widest font-bold">Book Your Date</p>
            <h2 id="booking-modal-title" className="text-xl sm:text-2xl font-bold tracking-tight text-brand-dark">
              Tell us about your event.
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close booking modal"
            className="w-10 h-10 border-2 border-brand-dark text-brand-dark shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 hover:bg-brand-accent hover:border-brand-accent hover:text-white transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div className="px-6 py-6 sm:px-8 sm:py-8">
          <BookingForm source={source} presetEventType={presetEventType} onSuccess={onClose} />
        </div>
      </div>
    </div>
  );
}
