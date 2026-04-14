"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AuditLogItem {
  id: string;
  module: string;
  entity_type: string;
  action: string;
  actor_email: string | null;
  created_at: string;
}

export default function StudioAuditPage() {
  const [rows, setRows] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/admin/studio/audit", { cache: "no-store" });
        const payload = await response.json();
        if (!response.ok || !payload.success) throw new Error(payload.error ?? "Failed to load audit logs");
        setRows(payload.data ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load audit logs");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-4 p-4 sm:p-6 md:p-8">
      <div>
        <h1 className="text-2xl font-semibold">Studio Audit Log</h1>
        <p className="text-sm text-muted-foreground">Immutable admin action trail for bookings and content.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent events</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading logs...</p>
          ) : error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No audit events yet.</p>
          ) : (
            <div className="space-y-2">
              {rows.map((row) => (
                <div key={row.id} className="rounded border p-3">
                  <p className="text-sm font-medium">
                    {row.module} · {row.action}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Entity: {row.entity_type} · Actor: {row.actor_email ?? "Unknown"} ·{" "}
                    {new Date(row.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
