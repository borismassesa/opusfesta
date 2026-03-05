"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function NewStudioBookingPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/admin/studio/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: String(formData.get("customerName") ?? ""),
          customerEmail: String(formData.get("customerEmail") ?? ""),
          customerPhone: String(formData.get("customerPhone") ?? ""),
          eventType: String(formData.get("eventType") ?? ""),
          preferredDate: String(formData.get("preferredDate") ?? ""),
          preferredStartTime: String(formData.get("preferredStartTime") ?? ""),
          durationMinutes: Number(formData.get("durationMinutes") ?? "60"),
          location: String(formData.get("location") ?? ""),
          message: String(formData.get("message") ?? ""),
          status: "pending",
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error ?? "Failed to create booking");
      router.push(`/studio/bookings/${payload.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create booking");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 p-4 sm:p-6 md:p-8">
      <div>
        <h1 className="text-2xl font-semibold">Add Booking</h1>
        <p className="text-sm text-muted-foreground">Create a manual booking from admin.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Booking details</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-2" onSubmit={onSubmit}>
            <Input name="customerName" placeholder="Customer name" required />
            <Input name="customerEmail" type="email" placeholder="Customer email" required />
            <Input name="customerPhone" placeholder="Customer phone" />
            <Input name="eventType" placeholder="Event type" required />
            <Input name="preferredDate" type="date" required />
            <Input name="preferredStartTime" type="time" />
            <Input name="durationMinutes" type="number" min={15} defaultValue={60} />
            <Input name="location" placeholder="Location" />
            <Textarea name="message" className="md:col-span-2" rows={4} placeholder="Internal details or notes" />
            {error ? <p className="md:col-span-2 text-sm text-destructive">{error}</p> : null}
            <div className="md:col-span-2 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.push("/studio/bookings")}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Create booking"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
