"use client";

import { useMemo } from "react";
import { Save, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useAdviceIdeasContent } from "@/context/AdviceIdeasContentContext";
import { toast } from "@/lib/toast";
import type { AdviceIdeasPageContent } from "@/context/AdviceIdeasContentContext";

export type AdviceIdeasSectionId = keyof AdviceIdeasPageContent;

interface AdviceIdeasPageContentEditorProps {
  categories?: string[];
  /** When set, only this section is rendered (for section-by-section editor with header in parent). */
  activeSection?: AdviceIdeasSectionId;
}

export function AdviceIdeasPageContentEditor({ categories = [], activeSection: singleSection }: AdviceIdeasPageContentEditorProps) {
  const {
    content,
    updateContent,
    resetContent,
    isLoading,
    isSaving,
    error,
    published,
    lastUpdatedAt,
    lastPublishedAt,
    saveDraft,
    publishContent,
  } = useAdviceIdeasContent();

  const categoryOptions = useMemo(() => categories.filter(Boolean), [categories]);

  const handleSave = async () => {
    try {
      await saveDraft();
      toast.success("Draft saved.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save draft");
    }
  };

  const handlePublish = async () => {
    try {
      await publishContent();
      toast.success("Content published.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to publish content");
    }
  };

  const showOnlySection = singleSection != null;

  return (
    <div className="space-y-6">
      {!showOnlySection && (
        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Advice & Ideas Page Content</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage the copy and labels for each section on the Advice & Ideas page.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={resetContent}
                disabled={isSaving || isLoading}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                disabled={isSaving || isLoading}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? "Saving..." : "Save Draft"}
              </Button>
              <Button
                size="sm"
                onClick={handlePublish}
                disabled={isSaving || isLoading}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Publish
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading content...</p>
            ) : (
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="rounded-md border border-border px-2 py-1">
                  {published ? "Published" : "Draft"}
                </span>
                {lastUpdatedAt && <span>Last saved {new Date(lastUpdatedAt).toLocaleDateString()}</span>}
                {lastPublishedAt && <span>Last published {new Date(lastPublishedAt).toLocaleDateString()}</span>}
                {error && <span className="text-destructive">{error}</span>}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {(!showOnlySection || singleSection === "hero") && (
      <Card>
        <CardHeader>
          <CardTitle>Hero</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              value={content.hero.title}
              onChange={(event) => updateContent("hero", { title: event.target.value })}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium">Subtitle</label>
            <Textarea
              rows={3}
              value={content.hero.subtitle}
              onChange={(event) => updateContent("hero", { subtitle: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Placeholder</label>
            <Input
              value={content.hero.formPlaceholder}
              onChange={(event) => updateContent("hero", { formPlaceholder: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Button Text</label>
            <Input
              value={content.hero.buttonText}
              onChange={(event) => updateContent("hero", { buttonText: event.target.value })}
            />
          </div>
        </CardContent>
      </Card>
      )}

      {(!showOnlySection || singleSection === "latest") && (
      <Card>
        <CardHeader>
          <CardTitle>Latest Stories</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Label</label>
            <Input
              value={content.latest.label}
              onChange={(event) => updateContent("latest", { label: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">CTA Text</label>
            <Input
              value={content.latest.ctaText}
              onChange={(event) => updateContent("latest", { ctaText: event.target.value })}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              value={content.latest.title}
              onChange={(event) => updateContent("latest", { title: event.target.value })}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              rows={3}
              value={content.latest.description}
              onChange={(event) => updateContent("latest", { description: event.target.value })}
            />
          </div>
        </CardContent>
      </Card>
      )}

      {(!showOnlySection || singleSection === "trending") && (
      <Card>
        <CardHeader>
          <CardTitle>Trending Guides</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Label</label>
            <Input
              value={content.trending.label}
              onChange={(event) => updateContent("trending", { label: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">CTA Text</label>
            <Input
              value={content.trending.ctaText}
              onChange={(event) => updateContent("trending", { ctaText: event.target.value })}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              value={content.trending.title}
              onChange={(event) => updateContent("trending", { title: event.target.value })}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              rows={3}
              value={content.trending.description}
              onChange={(event) => updateContent("trending", { description: event.target.value })}
            />
          </div>
        </CardContent>
      </Card>
      )}

      {(!showOnlySection || singleSection === "browseGoals") && (
      <Card>
        <CardHeader>
          <CardTitle>Browse By Goal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Label</label>
              <Input
                value={content.browseGoals.label}
                onChange={(event) => updateContent("browseGoals", { label: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={content.browseGoals.title}
                onChange={(event) => updateContent("browseGoals", { title: event.target.value })}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                rows={2}
                value={content.browseGoals.description}
                onChange={(event) => updateContent("browseGoals", { description: event.target.value })}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Goal Cards</h4>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  updateContent("browseGoals", {
                    items: [
                      ...content.browseGoals.items,
                      { title: "", description: "", category: "" },
                    ],
                  })
                }
              >
                Add goal
              </Button>
            </div>
            <div className="space-y-4">
              {content.browseGoals.items.map((item, index) => (
                <div key={index} className="rounded-xl border border-border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Goal {index + 1}</p>
                    {content.browseGoals.items.length > 1 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const next = content.browseGoals.items.filter((_, idx) => idx !== index);
                          updateContent("browseGoals", { items: next });
                        }}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-medium">Title</label>
                      <Input
                        value={item.title}
                        onChange={(event) => {
                          const next = [...content.browseGoals.items];
                          next[index] = { ...next[index], title: event.target.value };
                          updateContent("browseGoals", { items: next });
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium">Category</label>
                      <Input
                        list="advice-categories"
                        value={item.category}
                        onChange={(event) => {
                          const next = [...content.browseGoals.items];
                          next[index] = { ...next[index], category: event.target.value };
                          updateContent("browseGoals", { items: next });
                        }}
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-xs font-medium">Description</label>
                      <Textarea
                        rows={2}
                        value={item.description}
                        onChange={(event) => {
                          const next = [...content.browseGoals.items];
                          next[index] = { ...next[index], description: event.target.value };
                          updateContent("browseGoals", { items: next });
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      )}

      {(!showOnlySection || singleSection === "topics") && (
      <Card>
        <CardHeader>
          <CardTitle>Popular Topics</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Label</label>
            <Input
              value={content.topics.label}
              onChange={(event) => updateContent("topics", { label: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              value={content.topics.title}
              onChange={(event) => updateContent("topics", { title: event.target.value })}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              rows={2}
              value={content.topics.description}
              onChange={(event) => updateContent("topics", { description: event.target.value })}
            />
          </div>
        </CardContent>
      </Card>
      )}

      {(!showOnlySection || singleSection === "newsletter") && (
      <Card>
        <CardHeader>
          <CardTitle>Newsletter Strip</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Label</label>
            <Input
              value={content.newsletter.label}
              onChange={(event) => updateContent("newsletter", { label: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Button Text</label>
            <Input
              value={content.newsletter.buttonText}
              onChange={(event) => updateContent("newsletter", { buttonText: event.target.value })}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              value={content.newsletter.title}
              onChange={(event) => updateContent("newsletter", { title: event.target.value })}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              rows={2}
              value={content.newsletter.description}
              onChange={(event) => updateContent("newsletter", { description: event.target.value })}
            />
          </div>
        </CardContent>
      </Card>
      )}

      {(!showOnlySection || singleSection === "blog") && (
      <Card>
        <CardHeader>
          <CardTitle>Blog Header</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Label</label>
            <Input
              value={content.blog.label}
              onChange={(event) => updateContent("blog", { label: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              value={content.blog.title}
              onChange={(event) => updateContent("blog", { title: event.target.value })}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              rows={2}
              value={content.blog.description}
              onChange={(event) => updateContent("blog", { description: event.target.value })}
            />
          </div>
        </CardContent>
      </Card>
      )}

      {(!showOnlySection || singleSection === "cta") && (
      <Card>
        <CardHeader>
          <CardTitle>CTA Section</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Label</label>
            <Input
              value={content.cta.label}
              onChange={(event) => updateContent("cta", { label: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Button Text</label>
            <Input
              value={content.cta.buttonText}
              onChange={(event) => updateContent("cta", { buttonText: event.target.value })}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              value={content.cta.title}
              onChange={(event) => updateContent("cta", { title: event.target.value })}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              rows={3}
              value={content.cta.description}
              onChange={(event) => updateContent("cta", { description: event.target.value })}
            />
          </div>
        </CardContent>
      </Card>
      )}

      <datalist id="advice-categories">
        {categoryOptions.map((category) => (
          <option key={category} value={category} />
        ))}
      </datalist>
    </div>
  );
}
