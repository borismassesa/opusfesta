"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface PortfolioItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  full_description: string;
  highlights_json: string[];
  published: boolean;
}

export default function StudioPortfolioPage() {
  const [rows, setRows] = useState<PortfolioItem[]>([]);
  const [selected, setSelected] = useState<PortfolioItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/studio/portfolio", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error ?? "Failed to load portfolio");
      setRows(payload.data ?? []);
      if (!selected && payload.data?.length) setSelected(payload.data[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load portfolio");
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
      category: String(formData.get("category") ?? ""),
      description: String(formData.get("description") ?? ""),
      fullDescription: String(formData.get("fullDescription") ?? ""),
      highlightsJson: String(formData.get("highlights") ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      statsJson: [],
      mediaIds: [],
      published: Boolean(formData.get("published")),
      displayOrder: 0,
    };
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/studio/portfolio", {
        method: selected?.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error ?? "Failed to save");
      setSelected(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 p-4 sm:p-6 md:p-8">
      <div>
        <h1 className="text-2xl font-semibold">Studio Portfolio</h1>
        <p className="text-sm text-muted-foreground">Create and publish portfolio items for Studio showcase.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Items</CardTitle>
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
                  category: "",
                  description: "",
                  full_description: "",
                  highlights_json: [],
                  published: false,
                })
              }
            >
              New item
            </Button>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : rows.length === 0 ? (
              <p className="text-sm text-muted-foreground">No portfolio items yet.</p>
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
            <CardTitle className="text-base">{selected?.id ? "Edit item" : "Create item"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-3 md:grid-cols-2" onSubmit={submit}>
              <Input name="slug" placeholder="slug" required defaultValue={selected?.slug} />
              <Input name="title" placeholder="Title" required defaultValue={selected?.title} />
              <Input name="category" placeholder="Category" defaultValue={selected?.category} />
              <Input
                name="highlights"
                placeholder="Highlights,comma,separated"
                defaultValue={selected?.highlights_json?.join(", ")}
              />
              <Textarea
                name="description"
                rows={3}
                className="md:col-span-2"
                placeholder="Short description"
                defaultValue={selected?.description}
              />
              <Textarea
                name="fullDescription"
                rows={6}
                className="md:col-span-2"
                placeholder="Long description"
                defaultValue={selected?.full_description}
              />
              <label className="md:col-span-2 flex items-center gap-2 text-sm">
                <input type="checkbox" name="published" defaultChecked={selected?.published ?? false} />
                Published
              </label>
              {error ? <p className="md:col-span-2 text-sm text-destructive">{error}</p> : null}
              <div className="md:col-span-2">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save portfolio item"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
