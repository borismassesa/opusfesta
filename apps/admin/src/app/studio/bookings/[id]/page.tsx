"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface BookingDetail {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  event_type: string;
  preferred_date: string;
  preferred_start_time: string | null;
  location: string | null;
  message: string | null;
  status: "pending" | "confirmed" | "cancelled" | "rescheduled" | "completed";
  notes: Array<{ id: string; body: string; created_at: string }>;
  activity: Array<{ id: string; action_type: string; action_details: Record<string, unknown> | null; performed_at: string }>;
}

export default function BookingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingNote, setSavingNote] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/studio/bookings/${params.id}`, { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error ?? "Failed to load booking");
      setData(payload.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load booking");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const updateStatus = async (nextStatus: BookingDetail["status"]) => {
    if (!data) return;
    setSavingStatus(true);
    try {
      const response = await fetch(`/api/admin/studio/bookings/${data.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error ?? "Failed status update");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setSavingStatus(false);
    }
  };

  const submitNote = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!data) return;
    const form = new FormData(event.currentTarget);
    const body = String(form.get("body") ?? "").trim();
    if (!body) return;
    setSavingNote(true);
    try {
      const response = await fetch(`/api/admin/studio/bookings/${data.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, visibility: "internal" }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error ?? "Failed to add note");
      (event.currentTarget as HTMLFormElement).reset();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add note");
    } finally {
      setSavingNote(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading booking...</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-sm text-destructive">{error}</p>
        <Button variant="outline" className="mt-3" onClick={() => router.push("/studio/bookings")}>
          Back to bookings
        </Button>
      </div>
    );
  }

  if (!data) {
    return <div className="p-6 text-sm text-muted-foreground">Booking not found.</div>;
  }

  return (
    <div className="space-y-4 p-4 sm:p-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{data.customer_name}</h1>
          <p className="text-sm text-muted-foreground">{data.customer_email}</p>
        </div>
        <Badge variant="outline" className="capitalize">
          {data.status}
        </Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Booking Detail</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Event type:</span> {data.event_type}
            </p>
            <p>
              <span className="font-medium">Date:</span> {data.preferred_date}
            </p>
            <p>
              <span className="font-medium">Time:</span> {data.preferred_start_time ?? "Not set"}
            </p>
            <p>
              <span className="font-medium">Phone:</span> {data.customer_phone ?? "Not provided"}
            </p>
            <p>
              <span className="font-medium">Location:</span> {data.location ?? "Not provided"}
            </p>
            <p>
              <span className="font-medium">Message:</span> {data.message ?? "No message"}
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {(["pending", "confirmed", "rescheduled", "cancelled", "completed"] as const).map((item) => (
                <Button
                  key={item}
                  variant={item === data.status ? "default" : "outline"}
                  size="sm"
                  disabled={savingStatus}
                  onClick={() => updateStatus(item)}
                >
                  {item}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Internal Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-2" onSubmit={submitNote}>
              <Textarea name="body" rows={4} placeholder="Add internal note..." />
              <Button type="submit" size="sm" disabled={savingNote}>
                {savingNote ? "Saving..." : "Add note"}
              </Button>
            </form>
            <div className="mt-3 space-y-2">
              {data.notes.length === 0 ? (
                <p className="text-xs text-muted-foreground">No notes yet.</p>
              ) : (
                data.notes.map((note) => (
                  <div key={note.id} className="rounded border p-2">
                    <p className="text-sm">{note.body}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{new Date(note.created_at).toLocaleString()}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {data.activity.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <div className="space-y-2">
              {data.activity.map((entry) => (
                <div key={entry.id} className="rounded border p-2">
                  <p className="text-sm font-medium">{entry.action_type}</p>
                  {entry.action_details ? (
                    <pre className="mt-1 whitespace-pre-wrap text-xs text-muted-foreground">
                      {JSON.stringify(entry.action_details, null, 2)}
                    </pre>
                  ) : null}
                  <p className="text-xs text-muted-foreground">{new Date(entry.performed_at).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
