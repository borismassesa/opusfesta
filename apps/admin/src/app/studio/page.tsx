"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CalendarDays, CheckCircle2, Clock3, Plus, Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AlertItem {
  id: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "acknowledged" | "resolved";
  title: string;
  description: string | null;
}

interface MetricsResponse {
  todayBookings: number;
  weekBookings: number;
  upcomingBookings: number;
  cancellations: number;
  alerts: AlertItem[];
}

export default function StudioDashboardPage() {
  const [data, setData] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/admin/studio/dashboard/metrics", { cache: "no-store" });
        const payload = await response.json();
        if (!response.ok || !payload.success) {
          throw new Error(payload.error ?? "Failed to load metrics");
        }
        setData(payload.data);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load dashboard";
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Studio Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Booking operations, alerts, and quick actions for Studio.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/studio/content/pages">Publish Content</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/studio/availability">
              <Settings className="mr-2 h-4 w-4" />
              Change Hours
            </Link>
          </Button>
          <Button asChild>
            <Link href="/studio/bookings">
              <Plus className="mr-2 h-4 w-4" />
              Add Booking
            </Link>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Card key={idx}>
              <CardHeader>
                <CardTitle className="text-sm">Loading</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-6 w-24 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-destructive">{error}</CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Today Bookings</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <p className="text-2xl font-semibold">{data?.todayBookings ?? 0}</p>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">This Week</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <p className="text-2xl font-semibold">{data?.weekBookings ?? 0}</p>
                <Clock3 className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Upcoming</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <p className="text-2xl font-semibold">{data?.upcomingBookings ?? 0}</p>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Cancellations</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <p className="text-2xl font-semibold">{data?.cancellations ?? 0}</p>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Active Alerts</CardTitle>
              <CardDescription>Email failures, booking conflicts, and runtime issues.</CardDescription>
            </CardHeader>
            <CardContent>
              {!data?.alerts?.length ? (
                <p className="text-sm text-muted-foreground">No active alerts.</p>
              ) : (
                <div className="space-y-3">
                  {data.alerts.map((alert) => (
                    <div key={alert.id} className="rounded-md border p-3">
                      <p className="text-sm font-medium">{alert.title}</p>
                      {alert.description ? (
                        <p className="mt-1 text-xs text-muted-foreground">{alert.description}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
