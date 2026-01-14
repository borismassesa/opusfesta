"use client";

import { useState } from "react";
import { useCareersContent } from "@/context/CareersContentContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";

export function ProcessEditor() {
  const { content, updateContent } = useCareersContent();
  const { process } = content;

  const handleChange = (field: keyof typeof process, value: any) => {
    updateContent((prev) => ({
      ...prev,
      process: {
        ...prev.process,
        [field]: value,
      },
    }));
  };

  const addStep = () => {
    const newId = process.steps.length > 0 
      ? Math.max(...process.steps.map(s => s.id)) + 1 
      : 1;
    updateContent((prev) => ({
      ...prev,
      process: {
        ...prev.process,
        steps: [
          ...prev.process.steps,
          {
            id: newId,
            title: "",
            description: "",
          },
        ],
      },
    }));
  };

  const updateStep = (index: number, field: string, value: any) => {
    const newSteps = [...process.steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    handleChange("steps", newSteps);
  };

  const removeStep = (index: number) => {
    const newSteps = process.steps.filter((_, i) => i !== index);
    handleChange("steps", newSteps);
  };

  const moveStep = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === process.steps.length - 1)
    ) {
      return;
    }

    const newSteps = [...process.steps];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    handleChange("steps", newSteps);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Hiring Process</CardTitle>
          <CardDescription>Edit the hiring process timeline section</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="process-headline">Headline</Label>
            <Input
              id="process-headline"
              value={process.headline}
              onChange={(e) => handleChange("headline", e.target.value)}
              placeholder="The Journey"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="process-subheadline">Subheadline</Label>
            <Input
              id="process-subheadline"
              value={process.subheadline}
              onChange={(e) => handleChange("subheadline", e.target.value)}
              placeholder="How we hire"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Process Steps</Label>
              <Button type="button" variant="outline" size="sm" onClick={addStep}>
                <Plus className="w-4 h-4 mr-2" />
                Add Step
              </Button>
            </div>
            {process.steps.map((step, index) => (
              <Card key={index}>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">Step {index + 1}</h4>
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => moveStep(index, "up")}
                          disabled={index === 0}
                          className="h-7 w-7"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => moveStep(index, "down")}
                          disabled={index === process.steps.length - 1}
                          className="h-7 w-7"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeStep(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Step ID</Label>
                      <Input
                        type="number"
                        value={step.id}
                        onChange={(e) => updateStep(index, "id", parseInt(e.target.value) || 1)}
                        placeholder="1"
                        min={1}
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Title</Label>
                      <Input
                        value={step.title}
                        onChange={(e) => updateStep(index, "title", e.target.value)}
                        placeholder="Step title"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={step.description}
                      onChange={(e) => updateStep(index, "description", e.target.value)}
                      placeholder="Step description..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
