'use client';

import { createContext, useContext, useCallback, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface BookingModalContextValue {
  openBookingModal: (prefilledService?: string) => void;
}

const BookingModalContext = createContext<BookingModalContextValue>({
  openBookingModal: () => {},
});

export function useBookingModal() {
  return useContext(BookingModalContext);
}

export default function BookingModalProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const openBookingModal = useCallback((service?: string) => {
    const url = service ? `/book?service=${encodeURIComponent(service)}` : '/book';
    router.push(url);
  }, [router]);

  return (
    <BookingModalContext value={{ openBookingModal }}>
      {children}
    </BookingModalContext>
  );
}
