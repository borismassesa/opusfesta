'use client';

import { useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import AdminButton from '@/components/admin/ui/AdminButton';
import AdminToast from '@/components/admin/ui/AdminToast';

interface AvailabilityEntry {
  date: string;
  is_available: boolean;
  note: string | null;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getMonthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function AvailabilityPage() {
  const [current, setCurrent] = useState(() => new Date());
  const [availability, setAvailability] = useState<Map<string, AvailabilityEntry>>(new Map());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Map<string, boolean>>(new Map());

  const year = current.getFullYear();
  const month = current.getMonth();
  const monthKey = getMonthKey(current);
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);

  const fetchAvailability = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/availability?month=${monthKey}`);
      const data = await res.json();
      const map = new Map<string, AvailabilityEntry>();
      (data.availability || []).forEach((entry: AvailabilityEntry) => {
        map.set(entry.date, entry);
      });
      setAvailability(map);
      setPendingChanges(new Map());
    } finally {
      setLoading(false);
    }
  }, [monthKey]);

  useEffect(() => { fetchAvailability(); }, [fetchAvailability]);

  const toggleDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const existing = availability.get(dateStr);
    const currentlyAvailable = existing ? existing.is_available : true;
    const newAvailable = !currentlyAvailable;

    const newMap = new Map(availability);
    newMap.set(dateStr, { date: dateStr, is_available: newAvailable, note: existing?.note || null });
    setAvailability(newMap);

    const newPending = new Map(pendingChanges);
    newPending.set(dateStr, newAvailable);
    setPendingChanges(newPending);
  };

  const handleSave = async () => {
    if (pendingChanges.size === 0) return;
    setSaving(true);
    const items = Array.from(pendingChanges.entries()).map(([date, is_available]) => ({
      date,
      is_available,
      note: availability.get(date)?.note || null,
    }));
    await fetch('/api/admin/availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(items),
    });
    setPendingChanges(new Map());
    setSaving(false);
  };

  const prevMonth = () => setCurrent(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrent(new Date(year, month + 1, 1));

  const monthName = current.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-4">
      <AdminToast />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Availability</h1>
        {pendingChanges.size > 0 && (
          <AdminButton onClick={handleSave} loading={saving}>
            Save Changes ({pendingChanges.size})
          </AdminButton>
        )}
      </div>

      <div className="bg-white border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">{monthName}</h2>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 transition-colors">
            <ChevronRight className="w-5 h-5 text-gray-600" />
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
                const entry = availability.get(dateStr);
                const isAvailable = entry ? entry.is_available : true;
                const isPending = pendingChanges.has(dateStr);
                const isToday = new Date().toISOString().slice(0, 10) === dateStr;

                return (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`h-16 flex flex-col items-center justify-center transition-colors relative ${
                      isAvailable ? 'bg-white hover:bg-green-50' : 'bg-red-50 hover:bg-red-100'
                    } ${isPending ? 'ring-2 ring-inset ring-brand-accent' : ''}`}
                  >
                    <span className={`text-sm font-medium ${isToday ? 'text-brand-accent' : isAvailable ? 'text-gray-900' : 'text-red-600'}`}>
                      {day}
                    </span>
                    <span className={`text-[10px] mt-0.5 ${isAvailable ? 'text-green-600' : 'text-red-500'}`}>
                      {isAvailable ? 'Open' : 'Blocked'}
                    </span>
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
      </div>
    </div>
  );
}
