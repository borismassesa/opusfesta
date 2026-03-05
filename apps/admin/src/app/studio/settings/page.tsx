"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface SettingsPayload {
  emailRecipients: string[];
  branding: Record<string, unknown>;
  featureFlags: Record<string, unknown>;
  notificationPrefs: Record<string, unknown>;
  bookingRules: {
    leadTimeHours: number;
    maxAdvanceDays: number;
    allowWeekend: boolean;
    requirePhone: boolean;
    rescheduleWindowHours: number;
    cancellationPolicyText: string;
    autoConfirm: boolean;
    conflictPolicy: "reject" | "allow_with_warning";
  };
}

const DEFAULT_SETTINGS: SettingsPayload = {
  emailRecipients: [],
  branding: {},
  featureFlags: {},
  notificationPrefs: {},
  bookingRules: {
    leadTimeHours: 24,
    maxAdvanceDays: 180,
    allowWeekend: true,
    requirePhone: false,
    rescheduleWindowHours: 24,
    cancellationPolicyText: "",
    autoConfirm: false,
    conflictPolicy: "reject",
  },
};

export default function StudioSettingsPage() {
  const [data, setData] = useState<SettingsPayload>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/studio/settings", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error ?? "Failed to load settings");
      setData({ ...DEFAULT_SETTINGS, ...payload.data });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/studio/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error ?? "Failed to save settings");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 p-4 sm:p-6 md:p-8">
      <div>
        <h1 className="text-2xl font-semibold">Studio Settings</h1>
        <p className="text-sm text-muted-foreground">Email recipients, booking rules, branding, and feature toggles.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">System settings</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading settings...</p>
          ) : (
            <form className="grid gap-3 md:grid-cols-2" onSubmit={submit}>
              <Textarea
                rows={3}
                className="md:col-span-2"
                value={data.emailRecipients.join(", ")}
                onChange={(event) =>
                  setData((prev) => ({
                    ...prev,
                    emailRecipients: event.target.value
                      .split(",")
                      .map((value) => value.trim())
                      .filter(Boolean),
                  }))
                }
                placeholder="alerts@company.com,ops@company.com"
              />
              <Input
                type="number"
                min={0}
                value={data.bookingRules.leadTimeHours}
                onChange={(event) =>
                  setData((prev) => ({
                    ...prev,
                    bookingRules: { ...prev.bookingRules, leadTimeHours: Number(event.target.value) },
                  }))
                }
                placeholder="Lead time hours"
              />
              <Input
                type="number"
                min={1}
                value={data.bookingRules.maxAdvanceDays}
                onChange={(event) =>
                  setData((prev) => ({
                    ...prev,
                    bookingRules: { ...prev.bookingRules, maxAdvanceDays: Number(event.target.value) },
                  }))
                }
                placeholder="Max advance days"
              />
              <Input
                type="number"
                min={0}
                value={data.bookingRules.rescheduleWindowHours}
                onChange={(event) =>
                  setData((prev) => ({
                    ...prev,
                    bookingRules: { ...prev.bookingRules, rescheduleWindowHours: Number(event.target.value) },
                  }))
                }
                placeholder="Reschedule window hours"
              />
              <select
                className="h-10 rounded-md border bg-background px-3 text-sm"
                value={data.bookingRules.conflictPolicy}
                onChange={(event) =>
                  setData((prev) => ({
                    ...prev,
                    bookingRules: {
                      ...prev.bookingRules,
                      conflictPolicy: event.target.value as "reject" | "allow_with_warning",
                    },
                  }))
                }
              >
                <option value="reject">Reject conflicting booking</option>
                <option value="allow_with_warning">Allow with warning</option>
              </select>
              <Textarea
                rows={4}
                className="md:col-span-2"
                value={data.bookingRules.cancellationPolicyText}
                onChange={(event) =>
                  setData((prev) => ({
                    ...prev,
                    bookingRules: { ...prev.bookingRules, cancellationPolicyText: event.target.value },
                  }))
                }
                placeholder="Cancellation policy text"
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={data.bookingRules.allowWeekend}
                  onChange={(event) =>
                    setData((prev) => ({
                      ...prev,
                      bookingRules: { ...prev.bookingRules, allowWeekend: event.target.checked },
                    }))
                  }
                />
                Allow weekend bookings
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={data.bookingRules.requirePhone}
                  onChange={(event) =>
                    setData((prev) => ({
                      ...prev,
                      bookingRules: { ...prev.bookingRules, requirePhone: event.target.checked },
                    }))
                  }
                />
                Require customer phone
              </label>
              <label className="md:col-span-2 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={data.bookingRules.autoConfirm}
                  onChange={(event) =>
                    setData((prev) => ({
                      ...prev,
                      bookingRules: { ...prev.bookingRules, autoConfirm: event.target.checked },
                    }))
                  }
                />
                Auto-confirm bookings
              </label>
              {error ? <p className="md:col-span-2 text-sm text-destructive">{error}</p> : null}
              <div className="md:col-span-2">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save settings"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
