'use client';

import { useEffect, useState, useCallback } from 'react';

interface DaySlot {
  date: string;
  slots: Array<{ time_slot: string; available: boolean }>;
  blackout: boolean;
}

interface Props {
  onSlotSelected: (date: string, timeSlot: string, holdToken: string, expiresAt: string) => void;
}

const TIME_SLOT_LABELS: Record<string, string> = {
  morning: 'Morning (8am - 12pm)',
  afternoon: 'Afternoon (1pm - 5pm)',
  'all-day': 'Full Day (8am - 5pm)',
};

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function SlotPicker({ onSlotSelected }: Props) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState({
    year: today.getFullYear(),
    month: today.getMonth() + 1,
  });
  const [days, setDays] = useState<DaySlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [holdingSlot, setHoldingSlot] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const monthStr = `${currentMonth.year}-${String(currentMonth.month).padStart(2, '0')}`;

  const fetchAvailability = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/booking/availability?month=${monthStr}`);
      const data = await res.json();
      setDays(data.days || []);
    } catch {
      setError('Failed to load availability');
    } finally {
      setLoading(false);
    }
  }, [monthStr]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  const selectedDay = days.find(d => d.date === selectedDate);

  async function handleSlotClick(date: string, timeSlot: string) {
    setHoldingSlot(`${date}|${timeSlot}`);
    setError(null);
    try {
      const res = await fetch('/api/booking/hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, timeSlot }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onSlotSelected(date, timeSlot, data.holdToken, data.expiresAt);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to hold slot');
    } finally {
      setHoldingSlot(null);
    }
  }

  function prevMonth() {
    setCurrentMonth(prev => {
      if (prev.month === 1) return { year: prev.year - 1, month: 12 };
      return { ...prev, month: prev.month - 1 };
    });
    setSelectedDate(null);
  }

  function nextMonth() {
    setCurrentMonth(prev => {
      if (prev.month === 12) return { year: prev.year + 1, month: 1 };
      return { ...prev, month: prev.month + 1 };
    });
    setSelectedDate(null);
  }

  const firstDayOfWeek = new Date(currentMonth.year, currentMonth.month - 1, 1).getDay();
  const todayStr = today.toISOString().split('T')[0];
  const isPastMonth = new Date(currentMonth.year, currentMonth.month - 1) < new Date(today.getFullYear(), today.getMonth());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          disabled={isPastMonth}
          className="border-3 border-brand-border px-4 py-2 font-mono text-sm font-bold hover:bg-brand-dark hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          ← PREV
        </button>
        <h3 className="text-lg font-bold font-mono text-brand-dark">
          {MONTHS[currentMonth.month - 1]} {currentMonth.year}
        </h3>
        <button
          onClick={nextMonth}
          className="border-3 border-brand-border px-4 py-2 font-mono text-sm font-bold hover:bg-brand-dark hover:text-white transition-colors"
        >
          NEXT →
        </button>
      </div>

      {loading ? (
        <div className="h-64 border-3 border-brand-border bg-brand-bg animate-pulse" />
      ) : (
        <div>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center text-xs font-bold text-brand-muted py-2 font-mono">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {days.map(day => {
              const hasAvailable = day.slots.some(s => s.available);
              const isPast = day.date < todayStr;
              const isSelected = day.date === selectedDate;

              return (
                <button
                  key={day.date}
                  onClick={() => !isPast && !day.blackout && hasAvailable && setSelectedDate(day.date)}
                  disabled={isPast || day.blackout || !hasAvailable}
                  className={`aspect-square border-2 text-sm font-bold transition-all ${
                    isSelected
                      ? 'border-brand-accent bg-brand-accent text-white shadow-brutal-accent'
                      : isPast || day.blackout || !hasAvailable
                        ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                        : 'border-brand-border text-brand-dark hover:bg-brand-panel hover:shadow-brutal-sm cursor-pointer'
                  }`}
                >
                  {parseInt(day.date.split('-')[2])}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {error && (
        <div className="border-3 border-red-500 bg-red-50 p-4 text-red-700 text-sm font-bold">
          {error}
        </div>
      )}

      {selectedDay && (
        <div>
          <h4 className="font-bold text-brand-dark mb-3 font-mono uppercase tracking-wider text-sm">
            Available Times — {selectedDate}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {selectedDay.slots
              .filter(s => s.available)
              .map(slot => (
                <button
                  key={slot.time_slot}
                  onClick={() => handleSlotClick(selectedDate!, slot.time_slot)}
                  disabled={holdingSlot !== null}
                  className="border-3 border-brand-border bg-white p-4 text-left hover:shadow-brutal hover:border-brand-accent transition-all disabled:opacity-50"
                >
                  <span className="font-bold text-brand-dark block">
                    {TIME_SLOT_LABELS[slot.time_slot] || slot.time_slot}
                  </span>
                  {holdingSlot === `${selectedDate}|${slot.time_slot}` && (
                    <span className="text-brand-accent text-xs font-bold mt-1 block">
                      Reserving...
                    </span>
                  )}
                </button>
              ))}
            {selectedDay.slots.filter(s => s.available).length === 0 && (
              <p className="text-brand-muted text-sm col-span-3">No available time slots for this date.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
