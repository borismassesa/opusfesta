'use client';

import { ButtonHTMLAttributes, ReactNode } from "react";
import { useBooking } from "@/components/booking/BookingProvider";

type BookingTriggerButtonProps = {
  source: string;
  eventType?: string;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export default function BookingTriggerButton({
  source,
  eventType,
  children,
  onClick,
  type,
  ...props
}: BookingTriggerButtonProps) {
  const { openBooking } = useBooking();

  return (
    <button
      {...props}
      type={type ?? "button"}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          openBooking({ source, eventType });
        }
      }}
    >
      {children}
    </button>
  );
}
