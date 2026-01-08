"use client";

import { useState } from "react";
import { useCareersContent } from "@/context/CareersContentContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";

export function CultureEditor() {
  const { content, updateContent } = useCareersContent();
  const { culture } = content;

  const handleChange = (field: keyof typeof culture, value: any) => {
    updateContent((prev) => ({
      ...prev,
      culture: {
        ...prev.culture,
        [field]: value,
      },
    }));
  };

  const addParagraph = () => {
    updateContent((prev) => ({
      ...prev,
      culture: {
        ...prev.culture,
        paragraphs: [...prev.culture.paragraphs, ""],
      },
    }));
  };

  const updateParagraph = (index: number, value: string) => {
    const newParagraphs = [...culture.paragraphs];
    newParagraphs[index] = value;
    handleChange("paragraphs", newParagraphs);
  };

  const removeParagraph = (index: number) => {
    const newParagraphs = culture.paragraphs.filter((_, i) => i !== index);
    handleChange("paragraphs", newParagraphs);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Office Culture</CardTitle>
          <CardDescription>Edit the office culture section</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="culture-headline">Headline</Label>
            <Input
              id="culture-headline"
              value={culture.headline}
              onChange={(e) => handleChange("headline", e.target.value)}
              placeholder="☕ Office culture"
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
            {culture.paragraphs.map((paragraph, index) => (
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
        </CardContent>
      </Card>
    </div>
  );
}
