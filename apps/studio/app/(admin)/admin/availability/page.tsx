'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { BsChevronLeft, BsChevronRight, BsTrash } from 'react-icons/bs';
import AdminButton from '@/components/admin/ui/AdminButton';
import AdminToast from '@/components/admin/ui/AdminToast';

interface AvailabilityEntry {
  id?: string;
  date: string;
  time_slot: string;
  is_available: boolean;
  note: string | null;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
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

export default function AvailabilityPage() {
  const [current, setCurrent] = useState(() => new Date());
  const [availability, setAvailability] = useState<Map<string, AvailabilityEntry>>(new Map());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pendingUpserts, setPendingUpserts] = useState<Map<string, AvailabilityEntry>>(new Map());
  const [pendingDeletes, setPendingDeletes] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => toIsoDate(new Date()));
  const [newSlotTime, setNewSlotTime] = useState('09:00');
  const [newSlotStatus, setNewSlotStatus] = useState<'available' | 'blocked'>('blocked');
  const [newSlotNote, setNewSlotNote] = useState('');

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

  const addOrUpdateSpecificSlot = () => {
    if (!/^\d{2}:\d{2}$/.test(newSlotTime)) return;

    const key = getEntryKey(selectedDate, newSlotTime);
    const existing = availability.get(key);
    upsertEntry({
      id: existing?.id,
      date: selectedDate,
      time_slot: newSlotTime,
      is_available: newSlotStatus === 'available',
      note: newSlotNote.trim() || null,
    });
    setNewSlotNote('');
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

  const monthName = current.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-4">
      <AdminToast />
      <div className="flex items-center justify-end">
        {totalPendingChanges > 0 && (
          <AdminButton onClick={handleSave} loading={saving}>
            Save Changes ({totalPendingChanges})
          </AdminButton>
        )}
      </div>
      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 transition-colors">
            <BsChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">{monthName}</h2>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 transition-colors">
            <BsChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {loading ? (
          <div className="h-64 animate-pulse bg-gray-50" />
        ) : (
          <>
            <div className="grid grid-cols-7 gap-px mb-1">
              {DAYS.map((d) => (
                <div key={d} className="text-center text-xs font-semibold text-gray-500 uppercase py-2">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-px bg-gray-200">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="bg-gray-50 h-16" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dayEntries = entriesByDate.get(dateStr) || [];
                const allDayEntry = dayEntries.find((entry) => entry.time_slot === ALL_DAY_SLOT);
                const isAvailable = allDayEntry ? allDayEntry.is_available : true;
                const blockedSlotsCount = dayEntries.filter((entry) => entry.time_slot !== ALL_DAY_SLOT && !entry.is_available).length;
                const slotsCount = dayEntries.filter((entry) => entry.time_slot !== ALL_DAY_SLOT).length;
                const isPending = pendingDates.has(dateStr);
                const isToday = new Date().toISOString().slice(0, 10) === dateStr;
                const isSelected = selectedDate === dateStr;

                return (
                  <button
                    key={day}
                    onClick={() => toggleAllDay(dateStr)}
                    className={`h-16 flex flex-col items-center justify-center transition-colors relative ${
                      isAvailable ? 'bg-white hover:bg-green-50' : 'bg-red-50 hover:bg-red-100'
                    } ${isPending ? 'ring-2 ring-inset ring-brand-accent' : ''} ${isSelected ? 'outline outline-2 outline-offset-[-2px] outline-gray-900' : ''}`}
                  >
                    <span className={`text-sm font-medium ${isToday ? 'text-brand-accent' : isAvailable ? 'text-gray-900' : 'text-red-600'}`}>
                      {day}
                    </span>
                    <span className={`text-[10px] mt-0.5 ${isAvailable ? 'text-green-600' : 'text-red-500'}`}>
                      {isAvailable ? 'Open' : 'Blocked'}
                    </span>
                    {slotsCount > 0 && (
                      <span className="text-[10px] text-gray-500 mt-0.5">
                        {slotsCount} slot{slotsCount > 1 ? 's' : ''}{blockedSlotsCount > 0 ? ` • ${blockedSlotsCount} blocked` : ''}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}

        <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-white border border-gray-200" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-red-50 border border-red-200" />
            <span>Blocked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-white ring-2 ring-brand-accent" />
            <span>Unsaved</span>
          </div>
        </div>

        <div className="mt-6 border-t border-gray-200 pt-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Time Slots</h3>
              <p className="text-xs text-gray-500 mt-1">{formatDateLabel(selectedDate)}</p>
            </div>
            <AdminButton size="sm" variant="secondary" onClick={() => toggleAllDay(selectedDate)}>
              Toggle Day ({selectedAllDayEntry?.is_available ?? true ? 'Open' : 'Blocked'})
            </AdminButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[140px_160px_1fr_auto] gap-3">
            <input
              type="time"
              value={newSlotTime}
              onChange={(e) => setNewSlotTime(e.target.value)}
              className="h-10 border border-gray-300 px-3 text-sm"
            />
            <select
              value={newSlotStatus}
              onChange={(e) => setNewSlotStatus(e.target.value as 'available' | 'blocked')}
              className="h-10 border border-gray-300 px-3 text-sm bg-white"
            >
              <option value="blocked">Blocked slot</option>
              <option value="available">Open slot</option>
            </select>
            <input
              type="text"
              placeholder="Optional note"
              value={newSlotNote}
              onChange={(e) => setNewSlotNote(e.target.value)}
              className="h-10 border border-gray-300 px-3 text-sm"
            />
            <AdminButton size="sm" onClick={addOrUpdateSpecificSlot}>
              Add Time
            </AdminButton>
          </div>

          <div className="mt-4 space-y-2">
            {selectedSpecificEntries.length === 0 ? (
              <p className="text-sm text-gray-500">No specific time allocations for this date yet.</p>
            ) : (
              selectedSpecificEntries.map((entry) => (
                <div key={getEntryKey(entry.date, entry.time_slot)} className="flex flex-wrap items-center justify-between gap-3 border border-gray-200 px-3 py-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-gray-800">{entry.time_slot}</span>
                    <span className={`text-xs font-medium ${entry.is_available ? 'text-green-700' : 'text-red-600'}`}>
                      {entry.is_available ? 'Open' : 'Blocked'}
                    </span>
                    {entry.note && <span className="text-xs text-gray-500">{entry.note}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleSpecificSlot(entry)}
                      className="px-2.5 py-1.5 text-xs border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Toggle
                    </button>
                    <button
                      onClick={() => removeEntry(entry)}
                      className="p-2 border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                      aria-label={`Remove ${entry.time_slot} slot`}
                    >
                      <BsTrash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
