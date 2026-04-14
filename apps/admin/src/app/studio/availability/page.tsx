"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type HourRow = {
  weekday: number;
  is_open: boolean;
  open_time: string | null;
  close_time: string | null;
  slot_minutes: number;
  buffer_before_minutes: number;
  buffer_after_minutes: number;
};

type ExceptionRow = {
  id?: string;
  date: string;
  is_closed: boolean;
  override_open_time: string | null;
  override_close_time: string | null;
  reason: string | null;
};

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function StudioAvailabilityPage() {
  const [hours, setHours] = useState<HourRow[]>([]);
  const [previewFrom, setPreviewFrom] = useState(new Date().toISOString().slice(0, 10));
  const [previewTo, setPreviewTo] = useState(new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10));
  const [previewRows, setPreviewRows] = useState<Array<{ date: string; time: string; state: string }>>([]);
  const [exceptions, setExceptions] = useState<ExceptionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHours = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/studio/availability/hours", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error ?? "Failed to load");
      const rows: HourRow[] = payload.data ?? [];
      const normalized = WEEK_DAYS.map((_, weekday) => {
        const found = rows.find((row) => row.weekday === weekday);
        return (
          found ?? {
            weekday,
            is_open: false,
            open_time: "09:00:00",
            close_time: "17:00:00",
            slot_minutes: 60,
            buffer_before_minutes: 0,
            buffer_after_minutes: 0,
          }
        );
      });
      setHours(normalized);

      const exceptionsResponse = await fetch(
        `/api/admin/studio/availability/exceptions?from=${previewFrom}&to=${previewTo}`,
        { cache: "no-store" }
      );
      const exceptionsPayload = await exceptionsResponse.json();
      if (exceptionsResponse.ok && exceptionsPayload.success) {
        setExceptions(exceptionsPayload.data ?? []);
      } else {
        setExceptions([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  const loadPreview = async () => {
    const response = await fetch(
      `/api/admin/studio/availability/preview?from=${encodeURIComponent(previewFrom)}&to=${encodeURIComponent(previewTo)}`,
      { cache: "no-store" }
    );
    const payload = await response.json();
    if (response.ok && payload.success) {
      setPreviewRows(payload.data ?? []);
    }
  };

  useEffect(() => {
    loadHours();
  }, []);

  useEffect(() => {
    loadPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewFrom, previewTo]);

  const saveHours = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/studio/availability/hours", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rows: hours.map((row) => ({
            weekday: row.weekday,
            isOpen: row.is_open,
            openTime: row.open_time,
            closeTime: row.close_time,
            slotMinutes: row.slot_minutes,
            bufferBeforeMinutes: row.buffer_before_minutes,
            bufferAfterMinutes: row.buffer_after_minutes,
          })),
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error ?? "Failed to save");
      await loadHours();
      await loadPreview();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const saveExceptions = async () => {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/studio/availability/exceptions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rows: exceptions.map((row) => ({
            date: row.date,
            isClosed: row.is_closed,
            overrideOpenTime: row.override_open_time,
            overrideCloseTime: row.override_close_time,
            reason: row.reason,
          })),
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error ?? "Failed to save exceptions");
      await loadHours();
      await loadPreview();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save exceptions");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 p-4 sm:p-6 md:p-8">
      <div>
        <h1 className="text-2xl font-semibold">Availability & Store Hours</h1>
        <p className="text-sm text-muted-foreground">Manage weekly schedule and preview customer availability.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Weekly recurring hours</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : (
            <form className="space-y-3" onSubmit={saveHours}>
              {hours.map((row, idx) => (
                <div key={row.weekday} className="grid gap-2 rounded border p-3 md:grid-cols-7 md:items-center">
                  <p className="text-sm font-medium">{WEEK_DAYS[row.weekday]}</p>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={row.is_open}
                      onChange={(event) =>
                        setHours((prev) =>
                          prev.map((item, itemIdx) =>
                            itemIdx === idx ? { ...item, is_open: event.target.checked } : item
                          )
                        )
                      }
                    />
                    Open
                  </label>
                  <Input
                    type="time"
                    value={(row.open_time ?? "09:00:00").slice(0, 5)}
                    onChange={(event) =>
                      setHours((prev) =>
                        prev.map((item, itemIdx) => (itemIdx === idx ? { ...item, open_time: `${event.target.value}:00` } : item))
                      )
                    }
                  />
                  <Input
                    type="time"
                    value={(row.close_time ?? "17:00:00").slice(0, 5)}
                    onChange={(event) =>
                      setHours((prev) =>
                        prev.map((item, itemIdx) => (itemIdx === idx ? { ...item, close_time: `${event.target.value}:00` } : item))
                      )
                    }
                  />
                  <Input
                    type="number"
                    min={15}
                    value={row.slot_minutes}
                    onChange={(event) =>
                      setHours((prev) =>
                        prev.map((item, itemIdx) => (itemIdx === idx ? { ...item, slot_minutes: Number(event.target.value) } : item))
                      )
                    }
                  />
                  <Input
                    type="number"
                    min={0}
                    value={row.buffer_before_minutes}
                    onChange={(event) =>
                      setHours((prev) =>
                        prev.map((item, itemIdx) =>
                          itemIdx === idx ? { ...item, buffer_before_minutes: Number(event.target.value) } : item
                        )
                      )
                    }
                  />
                  <Input
                    type="number"
                    min={0}
                    value={row.buffer_after_minutes}
                    onChange={(event) =>
                      setHours((prev) =>
                        prev.map((item, itemIdx) =>
                          itemIdx === idx ? { ...item, buffer_after_minutes: Number(event.target.value) } : item
                        )
                      )
                    }
                  />
                </div>
              ))}
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save weekly hours"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Date exceptions (holidays / special hours)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setExceptions((prev) => [
                ...prev,
                {
                  date: new Date().toISOString().slice(0, 10),
                  is_closed: true,
                  override_open_time: null,
                  override_close_time: null,
                  reason: "",
                },
              ])
            }
          >
            Add exception
          </Button>
          {!exceptions.length ? (
            <p className="text-sm text-muted-foreground">No exceptions configured.</p>
          ) : (
            <div className="space-y-2">
              {exceptions.map((row, idx) => (
                <div key={`${row.date}-${idx}`} className="grid gap-2 rounded border p-3 md:grid-cols-6 md:items-center">
                  <Input
                    type="date"
                    value={row.date}
                    onChange={(event) =>
                      setExceptions((prev) =>
                        prev.map((item, itemIdx) => (itemIdx === idx ? { ...item, date: event.target.value } : item))
                      )
                    }
                  />
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={row.is_closed}
                      onChange={(event) =>
                        setExceptions((prev) =>
                          prev.map((item, itemIdx) =>
                            itemIdx === idx
                              ? {
                                  ...item,
                                  is_closed: event.target.checked,
                                  override_open_time: event.target.checked ? null : item.override_open_time ?? "09:00:00",
                                  override_close_time: event.target.checked ? null : item.override_close_time ?? "17:00:00",
                                }
                              : item
                          )
                        )
                      }
                    />
                    Closed
                  </label>
                  <Input
                    type="time"
                    value={(row.override_open_time ?? "09:00:00").slice(0, 5)}
                    disabled={row.is_closed}
                    onChange={(event) =>
                      setExceptions((prev) =>
                        prev.map((item, itemIdx) =>
                          itemIdx === idx ? { ...item, override_open_time: `${event.target.value}:00` } : item
                        )
                      )
                    }
                  />
                  <Input
                    type="time"
                    value={(row.override_close_time ?? "17:00:00").slice(0, 5)}
                    disabled={row.is_closed}
                    onChange={(event) =>
                      setExceptions((prev) =>
                        prev.map((item, itemIdx) =>
                          itemIdx === idx ? { ...item, override_close_time: `${event.target.value}:00` } : item
                        )
                      )
                    }
                  />
                  <Input
                    value={row.reason ?? ""}
                    onChange={(event) =>
                      setExceptions((prev) =>
                        prev.map((item, itemIdx) => (itemIdx === idx ? { ...item, reason: event.target.value } : item))
                      )
                    }
                    placeholder="Reason"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setExceptions((prev) => prev.filter((_, itemIdx) => itemIdx !== idx))}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
          <Button type="button" disabled={saving} onClick={saveExceptions}>
            {saving ? "Saving..." : "Save exceptions"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Customer preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col gap-2 md:flex-row">
            <Input type="date" value={previewFrom} onChange={(event) => setPreviewFrom(event.target.value)} />
            <Input type="date" value={previewTo} onChange={(event) => setPreviewTo(event.target.value)} />
            <Button type="button" variant="outline" onClick={loadPreview}>
              Refresh
            </Button>
          </div>
          {!previewRows.length ? (
            <p className="text-sm text-muted-foreground">No slots in selected range.</p>
          ) : (
            <div className="max-h-72 overflow-auto rounded border p-2">
              {previewRows.slice(0, 200).map((row, idx) => (
                <p key={`${row.date}-${row.time}-${idx}`} className="text-sm">
                  {row.date} {row.time} — <span className="capitalize">{row.state}</span>
                </p>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
