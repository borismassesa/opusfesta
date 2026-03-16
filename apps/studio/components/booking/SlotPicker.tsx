'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { BsChevronLeft, BsChevronRight, BsClock, BsCalendar3, BsSliders } from 'react-icons/bs';

interface Slot {
  time_slot: string;
  label: string;
  available: boolean;
}

interface DaySlot {
  date: string;
  dayOfWeek: string;
  hours: { from: string; to: string } | null;
  slots: Slot[];
  blackout: boolean;
  closed: boolean;
}

interface Props {
  onSlotSelected: (date: string, timeSlot: string, holdToken: string, expiresAt: string) => void;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MIN_CUSTOM_DURATION_HOURS = 2;

function formatDateDisplay(dateStr: string) {
  const d = new Date(`${dateStr}T12:00:00`);
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

function formatSlotLabel(slot: Slot) {
  if (slot.label) return slot.label;
  if (slot.time_slot.includes('-')) {
    const [from, to] = slot.time_slot.split('-');
    return `${formatTime(from)} – ${formatTime(to)}`;
  }
  return slot.time_slot;
}

/** Generate 30-minute time options between from and to (HH:MM format) */
function generateTimeOptions(from: string, to: string): string[] {
  const options: string[] = [];
  const [fromH, fromM] = from.split(':').map(Number);
  const [toH, toM] = to.split(':').map(Number);
  const startMin = fromH * 60 + fromM;
  const endMin = toH * 60 + toM;
  for (let m = startMin; m <= endMin; m += 30) {
    const h = Math.floor(m / 60);
    const min = m % 60;
    options.push(`${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`);
  }
  return options;
}

/** Calculate duration in hours between two HH:MM times */
function durationHours(from: string, to: string): number {
  const [fh, fm] = from.split(':').map(Number);
  const [th, tm] = to.split(':').map(Number);
  return (th * 60 + tm - fh * 60 - fm) / 60;
}

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
  const [showCustom, setShowCustom] = useState(false);
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

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

  // Generate time options for the custom picker based on selected day's working hours
  const timeOptions = useMemo(() => {
    if (!selectedDay?.hours) return [];
    return generateTimeOptions(selectedDay.hours.from, selectedDay.hours.to);
  }, [selectedDay]);

  // Reset custom picker when date changes
  useEffect(() => {
    setShowCustom(false);
    setCustomFrom('');
    setCustomTo('');
  }, [selectedDate]);

  // Auto-set sensible defaults when custom picker opens
  useEffect(() => {
    if (showCustom && selectedDay?.hours && !customFrom && !customTo) {
      setCustomFrom(selectedDay.hours.from);
      // Default "to" = from + 3 hours or end of day, whichever is earlier
      const [fh, fm] = selectedDay.hours.from.split(':').map(Number);
      const [th, tm] = selectedDay.hours.to.split(':').map(Number);
      const defaultEnd = Math.min(fh * 60 + fm + 180, th * 60 + tm);
      const dh = Math.floor(defaultEnd / 60);
      const dm = defaultEnd % 60;
      setCustomTo(`${String(dh).padStart(2, '0')}:${String(dm).padStart(2, '0')}`);
    }
  }, [showCustom, selectedDay, customFrom, customTo]);

  const customDuration = customFrom && customTo ? durationHours(customFrom, customTo) : 0;
  const isCustomValid = customFrom && customTo && customDuration >= MIN_CUSTOM_DURATION_HOURS;
  const customTimeSlot = customFrom && customTo ? `${customFrom}-${customTo}` : '';

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
      setError(e instanceof Error ? e.message : 'Failed to reserve slot');
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
      {/* Calendar card */}
      <div className="border-3 border-brand-border bg-white shadow-brutal">
        {/* Month navigation header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-3 border-brand-border bg-brand-dark">
          <button
            onClick={prevMonth}
            disabled={isPastMonth}
            className="w-9 h-9 flex items-center justify-center text-white hover:text-brand-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous month"
          >
            <BsChevronLeft className="w-4 h-4" />
          </button>
          <div className="text-center">
            <h3 className="text-lg font-bold font-mono text-white uppercase tracking-wider">
              {MONTHS[currentMonth.month - 1]}
            </h3>
            <p className="text-xs text-brand-muted font-mono">{currentMonth.year}</p>
          </div>
          <button
            onClick={nextMonth}
            className="w-9 h-9 flex items-center justify-center text-white hover:text-brand-accent transition-colors"
            aria-label="Next month"
          >
            <BsChevronRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="p-6">
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="aspect-square bg-brand-bg animate-pulse" />
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {DAY_HEADERS.map(d => (
                <div key={d} className="text-center text-[11px] font-bold text-brand-muted font-mono uppercase tracking-wider py-2">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Empty leading cells */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {/* Day cells */}
              {days.map(day => {
                const hasAvailable = day.slots.some(s => s.available);
                const isPast = day.date < todayStr;
                const isSelected = day.date === selectedDate;
                const isToday = day.date === todayStr;
                const isClosed = day.closed;
                const isOpen = !isPast && !day.blackout && !isClosed && hasAvailable;

                return (
                  <button
                    key={day.date}
                    onClick={() => isOpen && setSelectedDate(day.date)}
                    disabled={!isOpen}
                    className={`
                      relative aspect-square flex flex-col items-center justify-center gap-0.5 font-bold transition-all border-2
                      ${isSelected
                        ? 'border-brand-accent bg-brand-accent text-white shadow-brutal-accent'
                        : isToday && isOpen
                          ? 'border-brand-accent bg-green-50 text-brand-accent hover:shadow-brutal-accent'
                          : isPast
                            ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50/50'
                            : isClosed
                              ? 'border-gray-300 text-gray-400 cursor-not-allowed bg-gray-100'
                              : isOpen
                                ? 'border-emerald-300 text-brand-dark bg-emerald-50/50 hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-brutal-sm cursor-pointer'
                                : 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50'
                      }
                    `}
                  >
                    {/* Today dot */}
                    {isToday && (
                      <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand-accent" />
                    )}

                    <span className="text-sm">{parseInt(day.date.split('-')[2])}</span>

                    {isSelected ? (
                      <span className="text-[8px] font-mono leading-none">Selected</span>
                    ) : isPast ? null : isClosed ? (
                      <span className="text-[8px] font-mono text-gray-400 leading-none">Closed</span>
                    ) : isOpen ? (
                      <span className="text-[8px] font-mono text-emerald-600 leading-none">
                        {day.slots.filter(s => s.available).length} slot{day.slots.filter(s => s.available).length !== 1 ? 's' : ''}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-5 mt-4 pt-4 border-t border-brand-border/20">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-brand-dark font-mono">
                <div className="w-3.5 h-3.5 border-2 border-emerald-400 bg-emerald-50" />
                Open
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-brand-dark font-mono">
                <div className="w-3.5 h-3.5 border-2 border-gray-300 bg-gray-100" />
                Closed
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-brand-dark font-mono">
                <div className="w-3.5 h-3.5 border-2 border-brand-accent bg-brand-accent" />
                Selected
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-brand-dark font-mono">
                <div className="w-2 h-2 rounded-full bg-brand-accent" />
                Today
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Time slot selection */}
      {selectedDay && (
        <div className="border-3 border-brand-border bg-white shadow-brutal">
          <div className="px-6 py-4 border-b-2 border-brand-border/30 flex items-center gap-3">
            <BsCalendar3 className="w-4 h-4 text-brand-accent" />
            <div>
              <h4 className="font-bold text-brand-dark text-sm font-mono uppercase tracking-wider">
                {formatDateDisplay(selectedDate!)}
              </h4>
              {selectedDay.hours && (
                <p className="text-xs text-brand-muted mt-0.5">
                  From {formatTime(selectedDay.hours.from)} to {formatTime(selectedDay.hours.to)}
                </p>
              )}
            </div>
          </div>

          <div className="p-6">
            {selectedDay.slots.filter(s => s.available).length === 0 ? (
              <div className="text-center py-6">
                <BsClock className="w-8 h-8 text-brand-border mx-auto mb-2" />
                <p className="text-brand-muted text-sm font-mono">No available time slots for this date.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-brand-muted font-mono uppercase tracking-wider mb-2">
                  Quick select
                </p>
                {selectedDay.slots
                  .filter(s => s.available)
                  .map(slot => {
                    const isHolding = holdingSlot === `${selectedDate}|${slot.time_slot}`;
                    const parts = slot.time_slot.includes('-') ? slot.time_slot.split('-') : null;
                    const fromTime = parts ? formatTime(parts[0]) : null;
                    const toTime = parts ? formatTime(parts[1]) : null;

                    return (
                      <button
                        key={slot.time_slot}
                        onClick={() => { setShowCustom(false); handleSlotClick(selectedDate!, slot.time_slot); }}
                        disabled={holdingSlot !== null}
                        className="w-full flex items-center gap-4 border-3 border-brand-border bg-white p-4 text-left hover:bg-brand-panel hover:border-brand-accent hover:shadow-brutal-accent transition-all disabled:opacity-50 group"
                      >
                        <div className="w-10 h-10 border-2 border-brand-border flex items-center justify-center group-hover:border-brand-accent group-hover:bg-brand-accent/10 transition-colors shrink-0">
                          <BsClock className="w-4 h-4 text-brand-muted group-hover:text-brand-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-bold text-brand-dark block">
                            {formatSlotLabel(slot)}
                          </span>
                          {fromTime && toTime && (
                            <span className="text-xs text-brand-muted mt-0.5 block">
                              From <strong className="text-brand-dark">{fromTime}</strong> to <strong className="text-brand-dark">{toTime}</strong>
                            </span>
                          )}
                          {isHolding && (
                            <span className="text-brand-accent text-xs font-bold font-mono mt-0.5 block">
                              RESERVING YOUR SLOT...
                            </span>
                          )}
                        </div>
                        <BsChevronRight className="w-3 h-3 text-brand-muted group-hover:text-brand-accent transition-colors shrink-0" />
                      </button>
                    );
                  })}

                {/* Divider */}
                <div className="flex items-center gap-3 pt-2">
                  <div className="flex-1 h-px bg-brand-border/20" />
                  <span className="text-[10px] font-mono text-brand-muted uppercase tracking-wider">or</span>
                  <div className="flex-1 h-px bg-brand-border/20" />
                </div>

                {/* Custom Time Toggle */}
                {!showCustom ? (
                  <button
                    onClick={() => setShowCustom(true)}
                    disabled={holdingSlot !== null}
                    className="w-full flex items-center gap-4 border-3 border-dashed border-brand-border/60 bg-brand-bg/50 p-4 text-left hover:bg-brand-panel hover:border-brand-accent hover:border-solid hover:shadow-brutal-accent transition-all disabled:opacity-50 group"
                  >
                    <div className="w-10 h-10 border-2 border-brand-border/60 flex items-center justify-center group-hover:border-brand-accent group-hover:bg-brand-accent/10 transition-colors shrink-0">
                      <BsSliders className="w-4 h-4 text-brand-muted group-hover:text-brand-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-brand-dark block">Custom Time</span>
                      <span className="text-xs text-brand-muted mt-0.5 block">
                        Choose your own start and end time
                      </span>
                    </div>
                    <BsChevronRight className="w-3 h-3 text-brand-muted group-hover:text-brand-accent transition-colors shrink-0" />
                  </button>
                ) : (
                  <div className="border-3 border-brand-accent bg-brand-bg/30 p-5 space-y-4">
                    <div className="flex items-center gap-2 mb-1">
                      <BsSliders className="w-4 h-4 text-brand-accent" />
                      <span className="text-xs font-bold font-mono text-brand-dark uppercase tracking-wider">Custom Time</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-brand-muted font-mono uppercase tracking-wider mb-1.5">
                          From
                        </label>
                        <select
                          value={customFrom}
                          onChange={(e) => {
                            setCustomFrom(e.target.value);
                            // If current "to" is before or too close to new "from", auto-adjust
                            if (customTo && durationHours(e.target.value, customTo) < MIN_CUSTOM_DURATION_HOURS) {
                              const [fh, fm] = e.target.value.split(':').map(Number);
                              const newEnd = fh * 60 + fm + MIN_CUSTOM_DURATION_HOURS * 60;
                              const [th, tm] = selectedDay!.hours!.to.split(':').map(Number);
                              const maxEnd = th * 60 + tm;
                              const endMin = Math.min(newEnd, maxEnd);
                              const dh = Math.floor(endMin / 60);
                              const dm = endMin % 60;
                              setCustomTo(`${String(dh).padStart(2, '0')}:${String(dm).padStart(2, '0')}`);
                            }
                          }}
                          className="w-full border-3 border-brand-border bg-white px-3 py-2.5 font-mono font-bold text-brand-dark focus:border-brand-accent focus:outline-none transition-colors"
                        >
                          {timeOptions.slice(0, -1).map(t => (
                            <option key={t} value={t}>{formatTime(t)}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-brand-muted font-mono uppercase tracking-wider mb-1.5">
                          To
                        </label>
                        <select
                          value={customTo}
                          onChange={(e) => setCustomTo(e.target.value)}
                          className="w-full border-3 border-brand-border bg-white px-3 py-2.5 font-mono font-bold text-brand-dark focus:border-brand-accent focus:outline-none transition-colors"
                        >
                          {timeOptions
                            .filter(t => {
                              if (!customFrom) return true;
                              return durationHours(customFrom, t) >= MIN_CUSTOM_DURATION_HOURS;
                            })
                            .map(t => (
                              <option key={t} value={t}>{formatTime(t)}</option>
                            ))}
                        </select>
                      </div>
                    </div>

                    {/* Duration display */}
                    {customFrom && customTo && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-brand-muted font-mono">
                          Duration: <strong className="text-brand-dark">{customDuration}h</strong>
                          {customDuration < MIN_CUSTOM_DURATION_HOURS && (
                            <span className="text-red-500 ml-2">({MIN_CUSTOM_DURATION_HOURS}h minimum)</span>
                          )}
                        </span>
                        {selectedDay?.hours && (
                          <span className="text-[10px] text-brand-muted font-mono">
                            Studio hours: {formatTime(selectedDay.hours.from)} – {formatTime(selectedDay.hours.to)}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Confirm custom time button */}
                    <button
                      onClick={() => isCustomValid && handleSlotClick(selectedDate!, customTimeSlot)}
                      disabled={!isCustomValid || holdingSlot !== null}
                      className={`
                        w-full flex items-center justify-center gap-2 border-3 p-3 font-mono font-bold text-sm uppercase tracking-wider transition-all
                        ${isCustomValid
                          ? 'border-brand-accent bg-brand-accent text-white hover:shadow-brutal-accent'
                          : 'border-brand-border/40 bg-gray-100 text-gray-400 cursor-not-allowed'
                        }
                      `}
                    >
                      {holdingSlot === `${selectedDate}|${customTimeSlot}` ? (
                        <>RESERVING YOUR SLOT...</>
                      ) : (
                        <>
                          <BsClock className="w-3.5 h-3.5" />
                          {isCustomValid
                            ? `Book ${formatTime(customFrom)} to ${formatTime(customTo)}`
                            : 'Select a valid time range'
                          }
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setShowCustom(false)}
                      className="w-full text-center text-xs text-brand-muted hover:text-brand-dark font-mono transition-colors py-1"
                    >
                      Cancel custom time
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="border-3 border-red-500 bg-red-50 p-4 text-red-700 text-sm font-bold">
          {error}
        </div>
      )}
    </div>
  );
}
