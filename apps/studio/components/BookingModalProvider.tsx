'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import BookingModal from '@/components/BookingModal';

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
  const [isOpen, setIsOpen] = useState(false);
  const [prefilledService, setPrefilledService] = useState<string | undefined>();

  const openBookingModal = useCallback((service?: string) => {
    setPrefilledService(service);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setPrefilledService(undefined);
  }, []);

  return (
    // @ts-expect-error Dual @types/react versions in monorepo (root=18, studio=19) cause ReactNode mismatch
    <BookingModalContext value={{ openBookingModal }}>
      {children}
      <BookingModal isOpen={isOpen} onClose={closeModal} prefilledService={prefilledService} />
    </BookingModalContext>
  );
}
