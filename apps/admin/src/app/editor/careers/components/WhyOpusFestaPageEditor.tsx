"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, RotateCcw, RefreshCw, Plus, Trash2 } from "lucide-react";
import { useCareersContent } from "@/context/CareersContentContext";
import { useAuth } from "@clerk/nextjs";

type SectionId = "hero" | "reasons" | "difference" | "vision" | "cta";

interface WhyOpusFestaPageEditorProps {
  activeSection: SectionId;
}

const ICON_OPTIONS = [
  { value: "rocket", label: "Rocket" },
  { value: "trending", label: "Trending" },
  { value: "code", label: "Code" },
  { value: "users", label: "Users" },
  { value: "lightbulb", label: "Lightbulb" },
  { value: "award", label: "Award" },
];

export function WhyOpusFestaPageEditor({ activeSection }: WhyOpusFestaPageEditorProps) {
  const {
    resetContent,
    syncWithInitialContent,
    loadAdminContent,
    saveDraft,
    publishContent,
    isLoading,
    isSaving,
    error,
    published,
    lastUpdatedAt,
    lastPublishedAt,
    content,
    updateContent,
  } = useCareersContent();
  const { getToken, sessionClaims } = useAuth();
  const [role, setRole] = useState("");

  const canSave = ["owner", "admin", "editor"].includes(role);
  const canPublish = ["owner", "admin"].includes(role);

  useEffect(() => {
    loadAdminContent();
  }, [loadAdminContent]);

  useEffect(() => {
    const claimsRole = (sessionClaims as any)?.metadata?.role ?? "";
    setRole(claimsRole);
  }, [sessionClaims]);

  const handleSaveDraft = async () => {
    if (!canSave) {
      const { toast } = await import('@/lib/toast');
      toast.error(`Cannot save: Insufficient permissions. Your role: ${role || 'loading...'}`);
      return;
    }
    await saveDraft();
  };

  const handlePublish = async () => {
    if (!canPublish) {
      const { toast } = await import('@/lib/toast');
      toast.error(`Cannot publish: Insufficient permissions. Your role: ${role || 'loading...'}`);
      return;
    }
    await publishContent();
  };

  const handleSync = async () => {
    if (!canSave) {
      const { toast } = await import('@/lib/toast');
      toast.error(`Cannot sync: Insufficient permissions. Your role: ${role || 'loading...'}`);
      return;
    }
    await syncWithInitialContent();
  };

  const handleReset = async () => {
    if (!canSave) {
      const { toast } = await import('@/lib/toast');
      toast.error(`Cannot reset: Insufficient permissions. Your role: ${role || 'loading...'}`);
      return;
    }
    resetContent();
    const { toast } = await import('@/lib/toast');
    toast.info('Content reset to initial values (local only - click Save to persist)');
  };

  const updateWhyOpusFesta = (updater: (prev: typeof content.whyOpusFesta) => typeof content.whyOpusFesta) => {
    updateContent((prev) => ({
      ...prev,
      whyOpusFesta: updater(prev.whyOpusFesta),
    }));
  };

  const { whyOpusFesta } = content;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-4 sm:py-5 border-b border-border/60 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-5 min-w-0 flex-1">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight truncate">Why OpusFesta Editor</h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs text-muted-foreground mt-1.5">
              {isLoading ? (
                <span className="text-muted-foreground">Loading...</span>
              ) : (
                <>
                  {lastUpdatedAt && (
                    <span className="text-muted-foreground whitespace-nowrap">Last saved {new Date(lastUpdatedAt).toLocaleDateString()}</span>
                  )}
                  {published ? (
                    <span className="px-2 py-0.5 rounded-md bg-green-500/10 text-green-700 dark:text-green-400 font-medium border border-green-500/20 whitespace-nowrap">
                      Published
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium border border-amber-500/20 whitespace-nowrap">
                      Draft
                    </span>
                  )}
                  {error && (
                    <span className="text-destructive font-medium truncate" title={error}>
                      · Error: {error.length > 30 ? `${error.substring(0, 30)}...` : error}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap sm:flex-nowrap">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSync}
            disabled={!canSave || isSaving || isLoading}
            className="h-9 px-2 sm:px-3 flex-shrink-0"
            title="Sync with current page content"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="sr-only sm:not-sr-only sm:ml-0 ml-2">Sync</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={!canSave || isSaving || isLoading}
            className="h-9 px-2 sm:px-3 flex-shrink-0"
            title="Reset to initial content (local only)"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="sr-only sm:not-sr-only sm:ml-0 ml-2">Reset</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveDraft}
            disabled={!canSave || isSaving || isLoading}
            className="h-9 px-3 sm:px-4 flex-shrink-0"
            title={!canSave ? `Save disabled. Your role: ${role || 'loading...'}` : 'Save draft'}
          >
            <Save className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">{isSaving ? "Saving..." : "Save"}</span>
          </Button>
          {canPublish && (
            <Button 
              size="sm" 
              onClick={handlePublish} 
              disabled={isSaving || isLoading}
              className="h-9 px-3 sm:px-4 bg-foreground text-background hover:bg-foreground/90 flex-shrink-0"
            >
              <Save className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Publish</span>
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="flex-1 min-h-0 overflow-y-auto bg-muted/20">
          {activeSection === "hero" && (
            <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 sm:py-8 md:py-10">
              <div className="max-w-[1600px] mx-auto">
                <Card>
                  <CardHeader>
                    <CardTitle>Hero</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Headline (use line breaks)</Label>
                      <Textarea
                        value={whyOpusFesta.hero.headline}
                        onChange={(e) =>
                          updateWhyOpusFesta((prev) => ({
                            ...prev,
                            hero: { ...prev.hero, headline: e.target.value },
                          }))
                        }
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={whyOpusFesta.hero.description}
                        onChange={(e) =>
                          updateWhyOpusFesta((prev) => ({
                            ...prev,
                            hero: { ...prev.hero, description: e.target.value },
                          }))
                        }
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>CTA Text</Label>
                        <Input
                          value={whyOpusFesta.hero.ctaText}
                          onChange={(e) =>
                            updateWhyOpusFesta((prev) => ({
                              ...prev,
                              hero: { ...prev.hero, ctaText: e.target.value },
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>CTA Link</Label>
                        <Input
                          value={whyOpusFesta.hero.ctaLink}
                          onChange={(e) =>
                            updateWhyOpusFesta((prev) => ({
                              ...prev,
                              hero: { ...prev.hero, ctaLink: e.target.value },
                            }))
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeSection === "reasons" && (
            <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 sm:py-8 md:py-10">
              <div className="max-w-[1600px] mx-auto space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Reasons to Join</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Section Headline</Label>
                      <Input
                        value={whyOpusFesta.reasons.headline}
                        onChange={(e) =>
                          updateWhyOpusFesta((prev) => ({
                            ...prev,
                            reasons: { ...prev.reasons, headline: e.target.value },
                          }))
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={() =>
                      updateWhyOpusFesta((prev) => ({
                        ...prev,
                        reasons: {
                          ...prev.reasons,
                          items: [
                            ...prev.reasons.items,
                            { title: "", description: "", icon: "rocket" },
                          ],
                        },
                      }))
                    }
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Reason
                  </Button>
                </div>

                {whyOpusFesta.reasons.items.map((reason, index) => (
                  <Card key={`${reason.title}-${index}`}>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Reason #{index + 1}</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          updateWhyOpusFesta((prev) => ({
                            ...prev,
                            reasons: {
                              ...prev.reasons,
                              items: prev.reasons.items.filter((_, i) => i !== index),
                            },
                          }))
                        }
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Title</Label>
                          <Input
                            value={reason.title}
                            onChange={(e) =>
                              updateWhyOpusFesta((prev) => ({
                                ...prev,
                                reasons: {
                                  ...prev.reasons,
                                  items: prev.reasons.items.map((item, i) =>
                                    i === index ? { ...item, title: e.target.value } : item
                                  ),
                                },
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Icon</Label>
                          <select
                            className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
                            value={reason.icon}
                            onChange={(e) =>
                              updateWhyOpusFesta((prev) => ({
                                ...prev,
                                reasons: {
                                  ...prev.reasons,
                                  items: prev.reasons.items.map((item, i) =>
                                    i === index ? { ...item, icon: e.target.value } : item
                                  ),
                                },
                              }))
                            }
                          >
                            {ICON_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={reason.description}
                          onChange={(e) =>
                            updateWhyOpusFesta((prev) => ({
                              ...prev,
                              reasons: {
                                ...prev.reasons,
                                items: prev.reasons.items.map((item, i) =>
                                  i === index ? { ...item, description: e.target.value } : item
                                ),
                              },
                            }))
                          }
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeSection === "difference" && (
            <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 sm:py-8 md:py-10">
              <div className="max-w-[1600px] mx-auto space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>What Makes Us Different</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Section Headline</Label>
                      <Input
                        value={whyOpusFesta.difference.headline}
                        onChange={(e) =>
                          updateWhyOpusFesta((prev) => ({
                            ...prev,
                            difference: { ...prev.difference, headline: e.target.value },
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Intro Description</Label>
                      <Textarea
                        value={whyOpusFesta.difference.description}
                        onChange={(e) =>
                          updateWhyOpusFesta((prev) => ({
                            ...prev,
                            difference: { ...prev.difference, description: e.target.value },
                          }))
                        }
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={() =>
                      updateWhyOpusFesta((prev) => ({
                        ...prev,
                        difference: {
                          ...prev.difference,
                          items: [
                            ...prev.difference.items,
                            { title: "", description: "" },
                          ],
                        },
                      }))
                    }
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </div>

                {whyOpusFesta.difference.items.map((item, index) => (
                  <Card key={`${item.title}-${index}`}>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Item #{index + 1}</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          updateWhyOpusFesta((prev) => ({
                            ...prev,
                            difference: {
                              ...prev.difference,
                              items: prev.difference.items.filter((_, i) => i !== index),
                            },
                          }))
                        }
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                          value={item.title}
                          onChange={(e) =>
                            updateWhyOpusFesta((prev) => ({
                              ...prev,
                              difference: {
                                ...prev.difference,
                                items: prev.difference.items.map((entry, i) =>
                                  i === index ? { ...entry, title: e.target.value } : entry
                                ),
                              },
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={item.description}
                          onChange={(e) =>
                            updateWhyOpusFesta((prev) => ({
                              ...prev,
                              difference: {
                                ...prev.difference,
                                items: prev.difference.items.map((entry, i) =>
                                  i === index ? { ...entry, description: e.target.value } : entry
                                ),
                              },
                            }))
                          }
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeSection === "vision" && (
            <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 sm:py-8 md:py-10">
              <div className="max-w-[1600px] mx-auto space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Vision</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Headline</Label>
                      <Input
                        value={whyOpusFesta.vision.headline}
                        onChange={(e) =>
                          updateWhyOpusFesta((prev) => ({
                            ...prev,
                            vision: { ...prev.vision, headline: e.target.value },
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Paragraphs</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateWhyOpusFesta((prev) => ({
                              ...prev,
                              vision: {
                                ...prev.vision,
                                paragraphs: [...prev.vision.paragraphs, ""],
                              },
                            }))
                          }
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Paragraph
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {whyOpusFesta.vision.paragraphs.map((paragraph, index) => (
                          <div key={`vision-${index}`} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs text-muted-foreground">Paragraph {index + 1}</Label>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  updateWhyOpusFesta((prev) => ({
                                    ...prev,
                                    vision: {
                                      ...prev.vision,
                                      paragraphs: prev.vision.paragraphs.filter((_, i) => i !== index),
                                    },
                                  }))
                                }
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            <Textarea
                              value={paragraph}
                              onChange={(e) =>
                                updateWhyOpusFesta((prev) => ({
                                  ...prev,
                                  vision: {
                                    ...prev.vision,
                                    paragraphs: prev.vision.paragraphs.map((entry, i) =>
                                      i === index ? e.target.value : entry
                                    ),
                                  },
                                }))
                              }
                              rows={3}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeSection === "cta" && (
            <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 sm:py-8 md:py-10">
              <div className="max-w-[1600px] mx-auto">
                <Card>
                  <CardHeader>
                    <CardTitle>CTA Section</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Headline</Label>
                      <Input
                        value={whyOpusFesta.cta.headline}
                        onChange={(e) =>
                          updateWhyOpusFesta((prev) => ({
                            ...prev,
                            cta: { ...prev.cta, headline: e.target.value },
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={whyOpusFesta.cta.description}
                        onChange={(e) =>
                          updateWhyOpusFesta((prev) => ({
                            ...prev,
                            cta: { ...prev.cta, description: e.target.value },
                          }))
                        }
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Button Text</Label>
                        <Input
                          value={whyOpusFesta.cta.buttonText}
                          onChange={(e) =>
                            updateWhyOpusFesta((prev) => ({
                              ...prev,
                              cta: { ...prev.cta, buttonText: e.target.value },
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Button Link</Label>
                        <Input
                          value={whyOpusFesta.cta.buttonLink}
                          onChange={(e) =>
                            updateWhyOpusFesta((prev) => ({
                              ...prev,
                              cta: { ...prev.cta, buttonLink: e.target.value },
                            }))
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
