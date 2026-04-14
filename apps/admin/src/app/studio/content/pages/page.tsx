"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const DEFAULT_SLUGS = ["home", "faq", "privacy", "terms"];

export default function StudioContentPagesPage() {
  const [slug, setSlug] = useState("home");
  const [draft, setDraft] = useState("{}");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async (targetSlug: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/studio/content/pages?slug=${encodeURIComponent(targetSlug)}`, {
        cache: "no-store",
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error ?? "Failed to load page");
      const row = payload.data?.[0];
      setDraft(JSON.stringify(row?.draft_content ?? {}, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load page");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(slug);
  }, [slug]);

  const save = async (publish: boolean) => {
    setSaving(true);
    setError(null);
    try {
      const draftContent = JSON.parse(draft);
      const response = await fetch("/api/admin/studio/content/pages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, draftContent, publish }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error ?? "Failed to save page");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save page");
    } finally {
      setSaving(false);
    }
  };

  const createNewSlug = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const targetSlug = String(formData.get("slug") ?? "").trim();
    if (!targetSlug) return;
    setSlug(targetSlug);
  };

  return (
    <div className="space-y-4 p-4 sm:p-6 md:p-8">
      <div>
        <h1 className="text-2xl font-semibold">Studio Pages CMS</h1>
        <p className="text-sm text-muted-foreground">Manage draft and published content blocks for Studio pages.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Page selector</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {DEFAULT_SLUGS.map((value) => (
              <Button key={value} variant={value === slug ? "default" : "outline"} size="sm" onClick={() => setSlug(value)}>
                {value}
              </Button>
            ))}
          </div>
          <form className="flex gap-2" onSubmit={createNewSlug}>
            <Input name="slug" placeholder="Custom page slug (example: homepage-hero)" />
            <Button type="submit" variant="outline">
              Open slug
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Editor: {slug}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading page draft...</p>
          ) : (
            <Textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={22} className="font-mono text-xs" />
          )}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <div className="flex gap-2">
            <Button disabled={saving || loading} onClick={() => save(false)}>
              {saving ? "Saving..." : "Save draft"}
            </Button>
            <Button disabled={saving || loading} variant="outline" onClick={() => save(true)}>
              Publish content
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
