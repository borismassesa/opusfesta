"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface StudioService {
  id: string;
  slug: string;
  title: string;
  description: string;
  price_from_cents: number;
  default_duration_minutes: number;
  includes_json: string[];
  is_active: boolean;
}

export default function StudioServicesPage() {
  const [rows, setRows] = useState<StudioService[]>([]);
  const [selected, setSelected] = useState<StudioService | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/studio/services", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error ?? "Failed to load services");
      setRows(payload.data ?? []);
      if (!selected && payload.data?.length) setSelected(payload.data[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      id: selected?.id,
      slug: String(formData.get("slug") ?? ""),
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      priceFromCents: Number(formData.get("priceFromCents") ?? "0"),
      defaultDurationMinutes: Number(formData.get("defaultDurationMinutes") ?? "60"),
      includesJson: String(formData.get("includes") ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      isActive: Boolean(formData.get("isActive")),
      currency: "TZS",
      displayOrder: 0,
    };
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/studio/services", {
        method: selected?.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error ?? "Failed to save service");
      setSelected(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save service");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 p-4 sm:p-6 md:p-8">
      <div>
        <h1 className="text-2xl font-semibold">Studio Services</h1>
        <p className="text-sm text-muted-foreground">Manage services shown on Studio pages and booking flow.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setSelected({
                  id: "",
                  slug: "",
                  title: "",
                  description: "",
                  price_from_cents: 0,
                  default_duration_minutes: 60,
                  includes_json: [],
                  is_active: true,
                })
              }
            >
              New service
            </Button>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : rows.length === 0 ? (
              <p className="text-sm text-muted-foreground">No services yet.</p>
            ) : (
              rows.map((row) => (
                <button
                  key={row.id}
                  type="button"
                  className="w-full rounded border p-2 text-left text-sm"
                  onClick={() => setSelected(row)}
                >
                  <p className="font-medium">{row.title}</p>
                  <p className="text-xs text-muted-foreground">{row.slug}</p>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">{selected?.id ? "Edit service" : "Create service"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-3 md:grid-cols-2" onSubmit={submit}>
              <Input name="slug" required placeholder="slug" defaultValue={selected?.slug} />
              <Input name="title" required placeholder="Title" defaultValue={selected?.title} />
              <Input
                name="priceFromCents"
                type="number"
                min={0}
                required
                placeholder="Price from cents"
                defaultValue={selected?.price_from_cents ?? 0}
              />
              <Input
                name="defaultDurationMinutes"
                type="number"
                min={15}
                required
                placeholder="Default duration (minutes)"
                defaultValue={selected?.default_duration_minutes ?? 60}
              />
              <Input
                name="includes"
                className="md:col-span-2"
                placeholder="Includes,comma,separated"
                defaultValue={selected?.includes_json?.join(", ")}
              />
              <Textarea
                name="description"
                rows={5}
                className="md:col-span-2"
                placeholder="Service description"
                defaultValue={selected?.description}
              />
              <label className="md:col-span-2 flex items-center gap-2 text-sm">
                <input type="checkbox" name="isActive" defaultChecked={selected?.is_active ?? true} />
                Active
              </label>
              {error ? <p className="md:col-span-2 text-sm text-destructive">{error}</p> : null}
              <div className="md:col-span-2">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save service"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
