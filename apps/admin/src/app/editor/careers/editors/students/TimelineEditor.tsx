"use client";

import { useStudentsContent } from "@/context/StudentsContentContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";

export function TimelineEditor() {
  const { content, updateContent } = useStudentsContent();

  const updateTimelineHeadline = (value: string) => {
    updateContent((prev) => ({
      ...prev,
      timeline: { ...prev.timeline, headline: value },
    }));
  };

  const addStep = () => {
    updateContent((prev) => {
      const maxId = Math.max(...prev.timeline.steps.map((s) => s.id), 0);
      return {
        ...prev,
        timeline: {
          ...prev.timeline,
          steps: [
            ...prev.timeline.steps,
            {
              id: maxId + 1,
              title: "",
              description: "",
            },
          ],
        },
      };
    });
  };

  const removeStep = (id: number) => {
    updateContent((prev) => ({
      ...prev,
      timeline: {
        ...prev.timeline,
        steps: prev.timeline.steps.filter((s) => s.id !== id),
      },
    }));
  };

  const updateStep = (id: number, field: string, value: string) => {
    updateContent((prev) => ({
      ...prev,
      timeline: {
        ...prev.timeline,
        steps: prev.timeline.steps.map((step) =>
          step.id === id ? { ...step, [field]: value } : step
        ),
      },
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-2">How to Apply Timeline</h2>
          <p className="text-muted-foreground text-sm">
            Manage the application process timeline
          </p>
        </div>
        <Button onClick={addStep} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Step
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Timeline Header</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Headline</Label>
            <Input
              value={content.timeline.headline}
              onChange={(e) => updateTimelineHeadline(e.target.value)}
              placeholder="How to Apply"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {content.timeline.steps.map((step) => (
          <Card key={step.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Step #{step.id}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeStep(step.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={step.title}
                  onChange={(e) => updateStep(step.id, "title", e.target.value)}
                  placeholder="Browse Opportunities"
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={step.description}
                  onChange={(e) => updateStep(step.id, "description", e.target.value)}
                  placeholder="Explore our available student positions..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
