"use client";

import { useState } from "react";
import { useCareersContent } from "@/context/CareersContentContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";

// Icon mapping function - same as website
const getIconForBenefit = (title: string) => {
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('fertility')) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C8 2 5 5 5 9c0 4 3 7 7 7s7-3 7-7c0-4-3-7-7-7z"></path>
        <path d="M12 6v6M9 9h6"></path>
        <path d="M12 16v4M10 18h4"></path>
      </svg>
    );
  }
  
  if (titleLower.includes('mental') || titleLower.includes('therapy') || titleLower.includes('wellbeing')) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4"></circle>
        <path d="M6 21c0-3.3 2.7-6 6-6s6 2.7 6 6"></path>
      </svg>
    );
  }
  
  if (titleLower.includes('medical') || titleLower.includes('dental') || titleLower.includes('vision')) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="16"></line>
        <line x1="8" y1="12" x2="16" y2="12"></line>
      </svg>
    );
  }
  
  if (titleLower.includes('time off') || titleLower.includes('vacation') || titleLower.includes('holiday')) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
    );
  }
  
  if (titleLower.includes('parental') || titleLower.includes('family') || titleLower.includes('parent')) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    );
  }
  
  if (titleLower.includes('retirement') || titleLower.includes('savings') || titleLower.includes('matching')) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="20" x2="12" y2="10"></line>
        <line x1="18" y1="20" x2="18" y2="4"></line>
        <line x1="6" y1="20" x2="6" y2="16"></line>
      </svg>
    );
  }
  
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
  );
};

export function PerksEditor() {
  const { content, updateContent } = useCareersContent();
  const { perks } = content;

  const handleChange = (field: keyof typeof perks, value: any) => {
    updateContent((prev) => ({
      ...prev,
      perks: {
        ...prev.perks,
        [field]: value,
      },
    }));
  };

  const addPerk = () => {
    updateContent((prev) => ({
      ...prev,
      perks: {
        ...prev.perks,
        items: [
          ...prev.perks.items,
          {
            title: "",
            description: "",
            icon: "",
          },
        ],
      },
    }));
  };

  const updatePerk = (index: number, field: string, value: any) => {
    const newItems = [...perks.items];
    newItems[index] = { ...newItems[index], [field]: value };
    handleChange("items", newItems);
  };

  const removePerk = (index: number) => {
    const newItems = perks.items.filter((_, i) => i !== index);
    handleChange("items", newItems);
  };

  const movePerk = (index: number, direction: "up" | "down") => {
    const newItems = [...perks.items];
    const [removed] = newItems.splice(index, 1);
    if (direction === "up") {
      newItems.splice(index - 1, 0, removed);
    } else {
      newItems.splice(index + 1, 0, removed);
    }
    handleChange("items", newItems);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Benefits</CardTitle>
          <CardDescription>Edit the benefits section of the careers page</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="perks-headline">Headline</Label>
            <Input
              id="perks-headline"
              value={perks.headline}
              onChange={(e) => handleChange("headline", e.target.value)}
              placeholder="The upside"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="perks-description">Description</Label>
            <Textarea
              id="perks-description"
              value={perks.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Enter description..."
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Benefits</Label>
              <Button type="button" variant="outline" size="sm" onClick={addPerk}>
                <Plus className="w-4 h-4 mr-2" />
                Add Benefit
              </Button>
            </div>
            {perks.items.length > 0 ? (
              <div className="space-y-4">
                {perks.items.map((perk, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Benefit {index + 1}</h4>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => movePerk(index, "up")}
                            disabled={index === 0}
                            title="Move up"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => movePerk(index, "down")}
                            disabled={index === perks.items.length - 1}
                            title="Move down"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removePerk(index)}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-muted flex items-center justify-center border border-border">
                            <div className="text-foreground">
                              {getIconForBenefit(perk.title || "")}
                            </div>
                          </div>
                          <div className="flex-1">
                            <Input
                              value={perk.title}
                              onChange={(e) => updatePerk(index, "title", e.target.value)}
                              placeholder="Benefit title"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Icon is automatically generated based on the title
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={perk.description}
                          onChange={(e) => updatePerk(index, "description", e.target.value)}
                          placeholder="Benefit description..."
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                <p className="text-sm">No benefits added yet. Click "Add Benefit" to get started.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
