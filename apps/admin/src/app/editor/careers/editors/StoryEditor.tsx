"use client";

import { useState } from "react";
import { useCareersContent } from "@/context/CareersContentContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { ImageUpload } from "@/components/careers/ImageUpload";

export function StoryEditor() {
  const { content, updateContent } = useCareersContent();
  const { story } = content;

  const handleChange = (field: keyof typeof story, value: any) => {
    updateContent((prev) => ({
      ...prev,
      story: {
        ...prev.story,
        [field]: value,
      },
    }));
  };

  const addParagraph = () => {
    updateContent((prev) => ({
      ...prev,
      story: {
        ...prev.story,
        paragraphs: [...prev.story.paragraphs, ""],
      },
    }));
  };

  const updateParagraph = (index: number, value: string) => {
    const newParagraphs = [...story.paragraphs];
    newParagraphs[index] = value;
    handleChange("paragraphs", newParagraphs);
  };

  const removeParagraph = (index: number) => {
    const newParagraphs = story.paragraphs.filter((_, i) => i !== index);
    handleChange("paragraphs", newParagraphs);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Our Story</CardTitle>
          <CardDescription>Edit the story section of the careers page</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="story-headline">Headline</Label>
            <Input
              id="story-headline"
              value={story.headline}
              onChange={(e) => handleChange("headline", e.target.value)}
              placeholder="Our story"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Paragraphs</Label>
              <Button type="button" variant="outline" size="sm" onClick={addParagraph}>
                <Plus className="w-4 h-4 mr-2" />
                Add Paragraph
              </Button>
            </div>
            {story.paragraphs.map((paragraph, index) => (
              <div key={index} className="flex gap-2">
                <Textarea
                  value={paragraph}
                  onChange={(e) => updateParagraph(index, e.target.value)}
                  placeholder={`Paragraph ${index + 1}...`}
                  rows={3}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeParagraph(index)}
                  className="h-10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="story-link-text">Link Text</Label>
              <Input
                id="story-link-text"
                value={story.linkText}
                onChange={(e) => handleChange("linkText", e.target.value)}
                placeholder="Browse open positions"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="story-link-url">Link URL</Label>
              <Input
                id="story-link-url"
                value={story.linkUrl}
                onChange={(e) => handleChange("linkUrl", e.target.value)}
                placeholder="/careers/positions"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Story Image</Label>
            <ImageUpload
              value={story.image}
              onChange={(url) => handleChange("image", url)}
              folder="careers-story"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
