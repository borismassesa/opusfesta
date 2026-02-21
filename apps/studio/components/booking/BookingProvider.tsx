'use client';

import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import BookingModal from "@/components/booking/BookingModal";

type OpenBookingArgs = {
  source: string;
  eventType?: string;
};

type BookingContextValue = {
  openBooking: (args: OpenBookingArgs) => void;
  closeBooking: () => void;
};

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [source, setSource] = useState("studio-homepage");
  const [presetEventType, setPresetEventType] = useState<string | undefined>(undefined);

  const value = useMemo<BookingContextValue>(
    () => ({
      openBooking: ({ source: nextSource, eventType }) => {
        setSource(nextSource);
        setPresetEventType(eventType);
        setIsOpen(true);
      },
      closeBooking: () => setIsOpen(false),
    }),
    []
  );

  return (
    <BookingContext.Provider value={value}>
      {children}
      <BookingModal
        isOpen={isOpen}
        source={source}
        presetEventType={presetEventType}
        onClose={() => setIsOpen(false)}
      />
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBooking must be used within BookingProvider");
  }
  return context;
}
