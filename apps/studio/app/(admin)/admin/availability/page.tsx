'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { BsChevronLeft, BsChevronRight, BsTrash, BsClock, BsCalendar3, BsPlusLg, BsCircleFill, BsBuilding } from 'react-icons/bs';
import AdminButton from '@/components/admin/ui/AdminButton';
import AdminToast from '@/components/admin/ui/AdminToast';

interface AvailabilityEntry {
  id?: string;
  date: string;
  time_slot: string;
  is_available: boolean;
  note: string | null;
}

interface DayHours {
  open: boolean;
  from: string;
  to: string;
}

type WorkingHours = Record<string, DayHours>;

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DEFAULT_WORKING_HOURS: WorkingHours = {
  sunday: { open: false, from: '09:00', to: '17:00' },
  monday: { open: true, from: '09:00', to: '18:00' },
  tuesday: { open: true, from: '09:00', to: '18:00' },
  wednesday: { open: true, from: '09:00', to: '18:00' },
  thursday: { open: true, from: '09:00', to: '18:00' },
  friday: { open: true, from: '09:00', to: '18:00' },
  saturday: { open: true, from: '10:00', to: '15:00' },
};

const DAYS = DAY_LABELS;
const ALL_DAY_SLOT = 'all-day';

function getMonthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getEntryKey(date: string, timeSlot: string) {
  return `${date}|${timeSlot}`;
}

function parseEntryKey(key: string) {
  const [date, timeSlot] = key.split('|');
  return { date, timeSlot };
}

function formatDateLabel(isoDate: string) {
  const local = new Date(`${isoDate}T00:00:00`);
  return local.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

function formatTimeSlot(slot: string) {
  if (slot.includes('-')) {
    const [from, to] = slot.split('-');
    return `${formatTime(from)} \u2013 ${formatTime(to)}`;
  }
  return formatTime(slot);
}

export default function AvailabilityPage() {
  const [current, setCurrent] = useState(() => new Date());
  const [availability, setAvailability] = useState<Map<string, AvailabilityEntry>>(new Map());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pendingUpserts, setPendingUpserts] = useState<Map<string, AvailabilityEntry>>(new Map());
  const [pendingDeletes, setPendingDeletes] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => toIsoDate(new Date()));
  const [newSlotFrom, setNewSlotFrom] = useState('09:00');
  const [newSlotTo, setNewSlotTo] = useState('17:00');
  const [newSlotStatus, setNewSlotStatus] = useState<'available' | 'blocked'>('blocked');
  const [newSlotNote, setNewSlotNote] = useState('');

  // Working hours state
  const [workingHours, setWorkingHours] = useState<WorkingHours>(DEFAULT_WORKING_HOURS);
  const [workingHoursLoading, setWorkingHoursLoading] = useState(true);
  const [workingHoursSaving, setWorkingHoursSaving] = useState(false);
  const [workingHoursDirty, setWorkingHoursDirty] = useState(false);

  const year = current.getFullYear();
  const month = current.getMonth();
  const monthKey = getMonthKey(current);
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);
  const totalPendingChanges = pendingUpserts.size + pendingDeletes.size;

  const entriesByDate = useMemo(() => {
    const grouped = new Map<string, AvailabilityEntry[]>();
    availability.forEach((entry) => {
      const bucket = grouped.get(entry.date) || [];
      bucket.push(entry);
      grouped.set(entry.date, bucket);
    });
    grouped.forEach((entries) => {
      entries.sort((a, b) => a.time_slot.localeCompare(b.time_slot));
    });
    return grouped;
  }, [availability]);

  const pendingDates = useMemo(() => {
    const set = new Set<string>();
    pendingUpserts.forEach((_value, key) => set.add(parseEntryKey(key).date));
    pendingDeletes.forEach((key) => set.add(parseEntryKey(key).date));
    return set;
  }, [pendingUpserts, pendingDeletes]);

  const selectedDayEntries = entriesByDate.get(selectedDate) || [];
  const selectedAllDayEntry = selectedDayEntries.find((entry) => entry.time_slot === ALL_DAY_SLOT);
  const selectedSpecificEntries = selectedDayEntries.filter((entry) => entry.time_slot !== ALL_DAY_SLOT);
  const isDayOpen = selectedAllDayEntry ? selectedAllDayEntry.is_available : true;

  const fetchAvailability = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/availability?month=${monthKey}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to load availability');
      }
      const data = await res.json();
      const map = new Map<string, AvailabilityEntry>();
      (data.availability || []).forEach((raw: AvailabilityEntry) => {
        const entry: AvailabilityEntry = {
          ...raw,
          time_slot: raw.time_slot || ALL_DAY_SLOT,
        };
        map.set(getEntryKey(entry.date, entry.time_slot), entry);
      });
      setAvailability(map);
      setPendingUpserts(new Map());
      setPendingDeletes(new Set());
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load availability';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [monthKey]);

  useEffect(() => { fetchAvailability(); }, [fetchAvailability]);

  // Fetch working hours from studio_settings
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/settings');
        if (res.ok) {
          const data = await res.json();
          const wh = (data.settings || []).find((s: { key: string }) => s.key === 'working_hours');
          if (wh?.value) setWorkingHours({ ...DEFAULT_WORKING_HOURS, ...wh.value });
        }
      } catch { /* ignore */ }
      setWorkingHoursLoading(false);
    })();
  }, []);

  const saveWorkingHours = async () => {
    setWorkingHoursSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'working_hours', value: workingHours }),
      });
      if (!res.ok) throw new Error('Failed to save');
      setWorkingHoursDirty(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save working hours');
    } finally {
      setWorkingHoursSaving(false);
    }
  };

  const updateDayHours = (dayKey: string, updates: Partial<DayHours>) => {
    setWorkingHours(prev => ({
      ...prev,
      [dayKey]: { ...prev[dayKey], ...updates },
    }));
    setWorkingHoursDirty(true);
  };

  useEffect(() => {
    const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}-`;
    if (!selectedDate.startsWith(monthPrefix)) {
      setSelectedDate(`${monthPrefix}01`);
    }
  }, [year, month, selectedDate]);

  const upsertEntry = (entry: AvailabilityEntry) => {
    const key = getEntryKey(entry.date, entry.time_slot);
    const nextAvailability = new Map(availability);
    nextAvailability.set(key, entry);
    setAvailability(nextAvailability);

    const nextUpserts = new Map(pendingUpserts);
    nextUpserts.set(key, entry);
    setPendingUpserts(nextUpserts);

    if (pendingDeletes.has(key)) {
      const nextDeletes = new Set(pendingDeletes);
      nextDeletes.delete(key);
      setPendingDeletes(nextDeletes);
    }
  };

  const removeEntry = (entry: AvailabilityEntry) => {
    const key = getEntryKey(entry.date, entry.time_slot);
    const nextAvailability = new Map(availability);
    nextAvailability.delete(key);
    setAvailability(nextAvailability);

    const nextUpserts = new Map(pendingUpserts);
    nextUpserts.delete(key);
    setPendingUpserts(nextUpserts);

    const nextDeletes = new Set(pendingDeletes);
    if (entry.id) nextDeletes.add(key);
    else nextDeletes.delete(key);
    setPendingDeletes(nextDeletes);
  };

  const toggleAllDay = (dateStr: string) => {
    setSelectedDate(dateStr);
    const key = getEntryKey(dateStr, ALL_DAY_SLOT);
    const existing = availability.get(key);
    const currentlyAvailable = existing ? existing.is_available : true;
    const newAvailable = !currentlyAvailable;
    upsertEntry({
      id: existing?.id,
      date: dateStr,
      time_slot: ALL_DAY_SLOT,
      is_available: newAvailable,
      note: existing?.note || null,
    });
  };

  const selectDate = (dateStr: string) => {
    setSelectedDate(dateStr);
  };

  const addOrUpdateSpecificSlot = () => {
    if (!/^\d{2}:\d{2}$/.test(newSlotFrom) || !/^\d{2}:\d{2}$/.test(newSlotTo)) return;
    if (newSlotFrom >= newSlotTo) {
      setError('End time must be after start time');
      return;
    }

    const timeSlot = `${newSlotFrom}-${newSlotTo}`;
    const key = getEntryKey(selectedDate, timeSlot);
    const existing = availability.get(key);
    upsertEntry({
      id: existing?.id,
      date: selectedDate,
      time_slot: timeSlot,
      is_available: newSlotStatus === 'available',
      note: newSlotNote.trim() || null,
    });
    setNewSlotNote('');
    setError(null);
  };

  const toggleSpecificSlot = (entry: AvailabilityEntry) => {
    upsertEntry({
      ...entry,
      is_available: !entry.is_available,
    });
  };

  const handleSave = async () => {
    if (totalPendingChanges === 0) return;

    setSaving(true);
    setError(null);

    try {
      if (pendingUpserts.size > 0) {
        const upsertPayload = Array.from(pendingUpserts.values()).map((entry) => ({
          date: entry.date,
          time_slot: entry.time_slot,
          is_available: entry.is_available,
          note: entry.note,
        }));

        const res = await fetch('/api/admin/availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(upsertPayload),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || 'Failed to save availability changes');
        }
      }

      if (pendingDeletes.size > 0) {
        const deleteRequests = Array.from(pendingDeletes).map(async (key) => {
          const { date, timeSlot } = parseEntryKey(key);
          const url = new URL(`/api/admin/availability/${date}`, window.location.origin);
          url.searchParams.set('time', timeSlot);
          const res = await fetch(url.toString(), { method: 'DELETE' });
          if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.error || `Failed to delete slot ${timeSlot} on ${date}`);
          }
        });
        await Promise.all(deleteRequests);
      }

      await fetchAvailability();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save availability';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const prevMonth = () => setCurrent(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrent(new Date(year, month + 1, 1));

  const monthLabel = current.toLocaleString('default', { month: 'long' });
  const yearLabel = current.getFullYear();

  // Stats for the month
  const monthStats = useMemo(() => {
    let blocked = 0;
    let withSlots = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayEntries = entriesByDate.get(dateStr) || [];
      const allDay = dayEntries.find((e) => e.time_slot === ALL_DAY_SLOT);
      if (allDay && !allDay.is_available) blocked++;
      const specific = dayEntries.filter((e) => e.time_slot !== ALL_DAY_SLOT);
      if (specific.length > 0) withSlots++;
    }
    return { blocked, withSlots, open: daysInMonth - blocked };
  }, [entriesByDate, daysInMonth, year, month]);

  return (
    <div className="space-y-6">
      <AdminToast />

      {/* Error banner */}
      {error && (
        <div className="rounded-[var(--admin-radius)] border border-[var(--admin-destructive)]/20 bg-red-50 px-4 py-3 text-sm text-[var(--admin-destructive)]">
          {error}
        </div>
      )}

      {/* Month stats + save bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm text-[var(--admin-muted)]">
            <BsCircleFill className="w-2 h-2 text-emerald-500" />
            <span><strong className="text-[var(--admin-foreground)]">{monthStats.open}</strong> open</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[var(--admin-muted)]">
            <BsCircleFill className="w-2 h-2 text-red-400" />
            <span><strong className="text-[var(--admin-foreground)]">{monthStats.blocked}</strong> blocked</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[var(--admin-muted)]">
            <BsClock className="w-2.5 h-2.5 text-[var(--admin-primary)]" />
            <span><strong className="text-[var(--admin-foreground)]">{monthStats.withSlots}</strong> with slots</span>
          </div>
        </div>
        {totalPendingChanges > 0 && (
          <AdminButton onClick={handleSave} loading={saving} size="sm">
            Save {totalPendingChanges} change{totalPendingChanges > 1 ? 's' : ''}
          </AdminButton>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
        {/* Calendar */}
        <div className="bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-[var(--admin-radius)] shadow-[var(--admin-shadow-sm)] overflow-hidden">
          {/* Month header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--admin-border)]">
            <button
              onClick={prevMonth}
              className="w-9 h-9 flex items-center justify-center rounded-[calc(var(--admin-radius)-2px)] border border-[var(--admin-border)] text-[var(--admin-muted)] hover:bg-[var(--admin-secondary)] hover:text-[var(--admin-foreground)] transition-colors"
            >
              <BsChevronLeft className="w-3.5 h-3.5" />
            </button>
            <div className="text-center">
              <h2 className="text-lg font-semibold text-[var(--admin-foreground)] tracking-tight">{monthLabel}</h2>
              <p className="text-xs text-[var(--admin-muted)] mt-0.5">{yearLabel}</p>
            </div>
            <button
              onClick={nextMonth}
              className="w-9 h-9 flex items-center justify-center rounded-[calc(var(--admin-radius)-2px)] border border-[var(--admin-border)] text-[var(--admin-muted)] hover:bg-[var(--admin-secondary)] hover:text-[var(--admin-foreground)] transition-colors"
            >
              <BsChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="p-6">
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 35 }).map((_, i) => (
                  <div key={i} className="h-20 bg-[var(--admin-muted-surface)] animate-pulse rounded-[calc(var(--admin-radius)-4px)]" />
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4">
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {DAYS.map((d) => (
                  <div key={d} className="text-center text-[11px] font-semibold text-[var(--admin-muted)] uppercase tracking-wider py-2">
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-2">
                {/* Empty leading cells */}
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-20" />
                ))}

                {/* Day cells */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const dayEntries = entriesByDate.get(dateStr) || [];
                  const allDayEntry = dayEntries.find((entry) => entry.time_slot === ALL_DAY_SLOT);
                  const isAvailable = allDayEntry ? allDayEntry.is_available : true;
                  const slotsCount = dayEntries.filter((entry) => entry.time_slot !== ALL_DAY_SLOT).length;
                  const isPending = pendingDates.has(dateStr);
                  const isToday = new Date().toISOString().slice(0, 10) === dateStr;
                  const isSelected = selectedDate === dateStr;
                  const isPast = dateStr < new Date().toISOString().slice(0, 10);

                  return (
                    <button
                      key={day}
                      onClick={() => selectDate(dateStr)}
                      className={`
                        relative h-20 flex flex-col items-center justify-center gap-1 transition-all duration-150
                        rounded-[calc(var(--admin-radius)-4px)] border
                        ${isSelected
                          ? 'border-[var(--admin-primary)] bg-[var(--admin-primary)]/5 shadow-[0_0_0_1px_var(--admin-primary)]'
                          : isPending
                            ? 'border-[var(--admin-primary)]/40 bg-[var(--admin-primary)]/5'
                            : isAvailable
                              ? 'border-[var(--admin-border)] bg-[var(--admin-card)] hover:border-[var(--admin-primary)]/40 hover:bg-[var(--admin-secondary)]'
                              : 'border-red-200 bg-red-50/60 hover:bg-red-50'
                        }
                        ${isPast ? 'opacity-50' : ''}
                      `}
                    >
                      {/* Today indicator */}
                      {isToday && (
                        <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[var(--admin-primary)]" />
                      )}

                      {/* Pending dot */}
                      {isPending && !isSelected && (
                        <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-[var(--admin-primary)]" />
                      )}

                      <span className={`text-sm font-medium ${
                        isToday
                          ? 'text-[var(--admin-primary)]'
                          : isAvailable
                            ? 'text-[var(--admin-foreground)]'
                            : 'text-red-600'
                      }`}>
                        {day}
                      </span>

                      {!isAvailable ? (
                        <span className="text-[10px] font-medium text-red-500">Blocked</span>
                      ) : slotsCount > 0 ? (
                        <span className="text-[10px] text-[var(--admin-muted)]">
                          {slotsCount} slot{slotsCount > 1 ? 's' : ''}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Working Hours — below calendar */}
          <div className="border-t border-[var(--admin-border)]">
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 flex items-center justify-center rounded-[calc(var(--admin-radius)-2px)] bg-[var(--admin-secondary)]">
                  <BsBuilding className="w-4 h-4 text-[var(--admin-accent-foreground)]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--admin-foreground)]">Studio Hours</p>
                  <p className="text-xs text-[var(--admin-muted)] mt-0.5">Default weekly schedule</p>
                </div>
              </div>
              {workingHoursDirty && (
                <AdminButton size="sm" onClick={saveWorkingHours} loading={workingHoursSaving}>
                  Save
                </AdminButton>
              )}
            </div>

            <div className="px-6 pb-5">
              {workingHoursLoading ? (
                <div className="grid grid-cols-7 gap-3">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="h-20 bg-[var(--admin-muted-surface)] animate-pulse rounded-[calc(var(--admin-radius)-4px)]" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                  {DAY_KEYS.map((dayKey, i) => {
                    const day = workingHours[dayKey];
                    return (
                      <div
                        key={dayKey}
                        className={`
                          flex flex-col items-center gap-2.5 px-3 py-3.5 rounded-[calc(var(--admin-radius)-4px)] border transition-colors
                          ${day.open
                            ? 'border-[var(--admin-border)] bg-[var(--admin-card)]'
                            : 'border-[var(--admin-border)] bg-[var(--admin-muted-surface)]'
                          }
                        `}
                      >
                        <div className="flex items-center justify-between w-full gap-2">
                          <span className={`text-xs font-semibold uppercase tracking-wide ${day.open ? 'text-[var(--admin-foreground)]' : 'text-[var(--admin-muted)]'}`}>
                            {DAY_LABELS[i]}
                          </span>
                          <button
                            onClick={() => updateDayHours(dayKey, { open: !day.open })}
                            className={`
                              relative inline-flex h-4 w-7 flex-shrink-0 items-center rounded-full transition-colors duration-200
                              ${day.open ? 'bg-emerald-500' : 'bg-gray-300'}
                            `}
                          >
                            <span className={`
                              inline-block h-3 w-3 rounded-full bg-white shadow-sm transition-transform duration-200
                              ${day.open ? 'translate-x-[13px]' : 'translate-x-[2px]'}
                            `} />
                          </button>
                        </div>

                        {day.open ? (
                          <div className="flex flex-col gap-1 w-full">
                            <input
                              type="time"
                              value={day.from}
                              onChange={(e) => updateDayHours(dayKey, { from: e.target.value })}
                              className="h-7 w-full border border-[var(--admin-input)] rounded-[calc(var(--admin-radius)-4px)] px-2 text-xs text-[var(--admin-foreground)] bg-[var(--admin-card)] focus:outline-none focus:ring-1 focus:ring-[var(--admin-ring)]"
                            />
                            <input
                              type="time"
                              value={day.to}
                              onChange={(e) => updateDayHours(dayKey, { to: e.target.value })}
                              className="h-7 w-full border border-[var(--admin-input)] rounded-[calc(var(--admin-radius)-4px)] px-2 text-xs text-[var(--admin-foreground)] bg-[var(--admin-card)] focus:outline-none focus:ring-1 focus:ring-[var(--admin-ring)]"
                            />
                          </div>
                        ) : (
                          <span className="text-xs text-[var(--admin-muted)] italic py-3.5">Closed</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Day detail panel */}
        <div className="space-y-4">
          {/* Selected date card */}
          <div className="bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-[var(--admin-radius)] shadow-[var(--admin-shadow-sm)] overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--admin-border)] flex items-center gap-3">
              <div className="w-9 h-9 flex items-center justify-center rounded-[calc(var(--admin-radius)-2px)] bg-[var(--admin-secondary)]">
                <BsCalendar3 className="w-4 h-4 text-[var(--admin-accent-foreground)]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--admin-foreground)]">{formatDateLabel(selectedDate)}</p>
                <p className="text-xs text-[var(--admin-muted)] mt-0.5">
                  {isDayOpen ? 'Open for bookings' : 'Blocked for the day'}
                </p>
              </div>
            </div>

            <div className="p-5">
              {/* Day toggle */}
              <div className="flex items-center justify-between mb-5">
                <span className="text-sm text-[var(--admin-foreground)]">Day status</span>
                <button
                  onClick={() => toggleAllDay(selectedDate)}
                  className={`
                    relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200
                    ${isDayOpen ? 'bg-emerald-500' : 'bg-red-400'}
                  `}
                >
                  <span className={`
                    inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200
                    ${isDayOpen ? 'translate-x-6' : 'translate-x-1'}
                  `} />
                </button>
              </div>

              {/* Divider */}
              <div className="border-t border-[var(--admin-border)] -mx-5 mb-5" />

              {/* Time slots header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BsClock className="w-3.5 h-3.5 text-[var(--admin-muted)]" />
                  <span className="text-sm font-medium text-[var(--admin-foreground)]">Time Slots</span>
                </div>
                <span className="text-xs text-[var(--admin-muted)]">
                  {selectedSpecificEntries.length} slot{selectedSpecificEntries.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Existing slots */}
              <div className="space-y-2 mb-5">
                {selectedSpecificEntries.length === 0 ? (
                  <div className="py-8 text-center">
                    <BsClock className="w-8 h-8 text-[var(--admin-border)] mx-auto mb-2" />
                    <p className="text-sm text-[var(--admin-muted)]">No time slots</p>
                    <p className="text-xs text-[var(--admin-muted)] mt-1 opacity-60">Add specific time blocks below</p>
                  </div>
                ) : (
                  selectedSpecificEntries.map((entry) => (
                    <div
                      key={getEntryKey(entry.date, entry.time_slot)}
                      className={`
                        flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-[calc(var(--admin-radius)-4px)] border transition-colors
                        ${entry.is_available
                          ? 'border-emerald-200 bg-emerald-50/50'
                          : 'border-red-200 bg-red-50/50'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${entry.is_available ? 'bg-emerald-500' : 'bg-red-400'}`} />
                        <span className="text-sm font-mono font-medium text-[var(--admin-foreground)]">
                          {formatTimeSlot(entry.time_slot)}
                        </span>
                        {entry.note && (
                          <span className="text-xs text-[var(--admin-muted)] truncate">{entry.note}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => toggleSpecificSlot(entry)}
                          className={`
                            px-2.5 py-1 text-[11px] font-medium rounded-[calc(var(--admin-radius)-4px)] border transition-colors
                            ${entry.is_available
                              ? 'border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                              : 'border-red-300 text-red-600 hover:bg-red-100'
                            }
                          `}
                        >
                          {entry.is_available ? 'Open' : 'Blocked'}
                        </button>
                        <button
                          onClick={() => removeEntry(entry)}
                          className="w-7 h-7 flex items-center justify-center rounded-[calc(var(--admin-radius)-4px)] text-[var(--admin-muted)] hover:text-[var(--admin-destructive)] hover:bg-red-50 transition-colors"
                          aria-label={`Remove ${entry.time_slot} slot`}
                        >
                          <BsTrash className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-[var(--admin-border)] -mx-5 mb-5" />

              {/* Add slot form */}
              <div>
                <p className="text-xs font-medium text-[var(--admin-muted)] uppercase tracking-wider mb-3">Add Time Slot</p>
                <div className="space-y-2.5">
                  {/* From / To row */}
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                    <div>
                      <label className="block text-[11px] text-[var(--admin-muted)] mb-1">From</label>
                      <input
                        type="time"
                        value={newSlotFrom}
                        onChange={(e) => setNewSlotFrom(e.target.value)}
                        className="w-full h-9 border border-[var(--admin-input)] rounded-[calc(var(--admin-radius)-4px)] px-3 text-sm text-[var(--admin-foreground)] bg-[var(--admin-card)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-ring)] focus:border-[var(--admin-primary)]"
                      />
                    </div>
                    <span className="text-[var(--admin-muted)] text-xs mt-5">&rarr;</span>
                    <div>
                      <label className="block text-[11px] text-[var(--admin-muted)] mb-1">To</label>
                      <input
                        type="time"
                        value={newSlotTo}
                        onChange={(e) => setNewSlotTo(e.target.value)}
                        className="w-full h-9 border border-[var(--admin-input)] rounded-[calc(var(--admin-radius)-4px)] px-3 text-sm text-[var(--admin-foreground)] bg-[var(--admin-card)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-ring)] focus:border-[var(--admin-primary)]"
                      />
                    </div>
                  </div>
                  {/* Status */}
                  <select
                    value={newSlotStatus}
                    onChange={(e) => setNewSlotStatus(e.target.value as 'available' | 'blocked')}
                    className="w-full h-9 border border-[var(--admin-input)] rounded-[calc(var(--admin-radius)-4px)] px-3 text-sm text-[var(--admin-foreground)] bg-[var(--admin-card)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-ring)] focus:border-[var(--admin-primary)]"
                  >
                    <option value="blocked">Blocked</option>
                    <option value="available">Open</option>
                  </select>
                  {/* Note */}
                  <input
                    type="text"
                    placeholder="Optional note..."
                    value={newSlotNote}
                    onChange={(e) => setNewSlotNote(e.target.value)}
                    className="w-full h-9 border border-[var(--admin-input)] rounded-[calc(var(--admin-radius)-4px)] px-3 text-sm text-[var(--admin-foreground)] bg-[var(--admin-card)] placeholder:text-[var(--admin-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-ring)] focus:border-[var(--admin-primary)]"
                  />
                  <AdminButton size="sm" onClick={addOrUpdateSpecificSlot} className="w-full" icon={<BsPlusLg className="w-3 h-3" />}>
                    Add Slot
                  </AdminButton>
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-[var(--admin-radius)] px-5 py-3.5">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[var(--admin-muted)]">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-[3px] border border-[var(--admin-border)] bg-[var(--admin-card)]" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-[3px] border border-red-200 bg-red-50/60" />
                <span>Blocked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-[3px] border border-[var(--admin-primary)]/40 bg-[var(--admin-primary)]/5" />
                <span>Unsaved</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--admin-primary)]" />
                <span>Today</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
