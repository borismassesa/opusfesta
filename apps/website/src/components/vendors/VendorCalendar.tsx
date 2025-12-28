"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";

interface VendorCalendarProps {
  selectedDates: { checkIn: Date | null; checkOut: Date | null };
  onDateSelect: (dates: { checkIn: Date | null; checkOut: Date | null }) => void;
  unavailableDates?: Date[];
}

export function VendorCalendar({
  selectedDates,
  onDateSelect,
  unavailableDates = [],
}: VendorCalendarProps) {
  const [currentMonth1, setCurrentMonth1] = useState(new Date());
  const [currentMonth2, setCurrentMonth2] = useState(addMonths(new Date(), 1));

  const handleDateClick = (date: Date) => {
    if (unavailableDates.some((d) => isSameDay(d, date))) {
      return; // Don't allow selection of unavailable dates
    }

    if (!selectedDates.checkIn || (selectedDates.checkIn && selectedDates.checkOut)) {
      // Start new selection
      onDateSelect({ checkIn: date, checkOut: null });
    } else if (selectedDates.checkIn && !selectedDates.checkOut) {
      // Complete selection
      if (date < selectedDates.checkIn) {
        // If clicked date is before check-in, swap them
        onDateSelect({ checkIn: date, checkOut: selectedDates.checkIn });
      } else {
        onDateSelect({ checkIn: selectedDates.checkIn, checkOut: date });
      }
    }
  };

  const isDateUnavailable = (date: Date) => {
    return unavailableDates.some((d) => isSameDay(d, date));
  };

  const isDateInRange = (date: Date) => {
    if (!selectedDates.checkIn || !selectedDates.checkOut) return false;
    return date >= selectedDates.checkIn && date <= selectedDates.checkOut;
  };

  const isDateSelected = (date: Date) => {
    return (
      (selectedDates.checkIn && isSameDay(date, selectedDates.checkIn)) ||
      (selectedDates.checkOut && isSameDay(date, selectedDates.checkOut))
    );
  };

  const renderCalendar = (month: Date, isFirst: boolean) => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Get first day of week for the month
    const firstDayOfWeek = monthStart.getDay();
    const emptyDays = Array(firstDayOfWeek).fill(null);

    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">{format(month, "MMMM yyyy")}</h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                if (isFirst) {
                  setCurrentMonth1(subMonths(currentMonth1, 1));
                } else {
                  setCurrentMonth2(subMonths(currentMonth2, 1));
                }
              }}
              className="border-border"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                if (isFirst) {
                  setCurrentMonth1(addMonths(currentMonth1, 1));
                } else {
                  setCurrentMonth2(addMonths(currentMonth2, 1));
                }
              }}
              className="border-border"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
            <div key={`day-${index}`} className="text-center text-sm font-semibold text-secondary py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {emptyDays.map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          ))}
          {days.map((day) => {
            const unavailable = isDateUnavailable(day);
            const inRange = isDateInRange(day);
            const selected = isDateSelected(day);
            const isCheckIn = selectedDates.checkIn && isSameDay(day, selectedDates.checkIn);
            const isCheckOut = selectedDates.checkOut && isSameDay(day, selectedDates.checkOut);

            return (
              <button
                key={day.toISOString()}
                onClick={() => handleDateClick(day)}
                disabled={unavailable || !isSameMonth(day, month)}
                className={`
                  aspect-square text-sm rounded-lg transition-colors
                  ${unavailable || !isSameMonth(day, month)
                    ? "text-secondary/30 cursor-not-allowed"
                    : "hover:bg-surface cursor-pointer"
                  }
                  ${selected
                    ? "bg-primary text-background font-semibold"
                    : inRange
                    ? "bg-primary/20 text-primary"
                    : ""
                  }
                `}
              >
                {format(day, "d")}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="border border-border rounded-2xl bg-background p-6">
      <div className="flex items-center gap-2 mb-6">
        <CalendarIcon className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-semibold">Select Dates</h3>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {renderCalendar(currentMonth1, true)}
        {renderCalendar(currentMonth2, false)}
      </div>

      {(selectedDates.checkIn || selectedDates.checkOut) && (
        <div className="mt-6 pt-6 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDateSelect({ checkIn: null, checkOut: null })}
            className="text-secondary"
          >
            Clear dates
          </Button>
        </div>
      )}
    </div>
  );
}

