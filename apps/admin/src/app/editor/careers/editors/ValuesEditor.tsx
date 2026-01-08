"use client";

import { useState } from "react";
import { useCareersContent } from "@/context/CareersContentContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";

export function ValuesEditor() {
  const { content, updateContent } = useCareersContent();
  const { values } = content;

  const handleChange = (field: keyof typeof values, value: any) => {
    updateContent((prev) => ({
      ...prev,
      values: {
        ...prev.values,
        [field]: value,
      },
    }));
  };

  const addValue = () => {
    updateContent((prev) => ({
      ...prev,
      values: {
        ...prev.values,
        items: [
          ...prev.values.items,
          {
            title: "",
            description: "",
          },
        ],
      },
    }));
  };

  const updateValue = (index: number, field: string, value: any) => {
    const newItems = [...values.items];
    newItems[index] = { ...newItems[index], [field]: value };
    handleChange("items", newItems);
  };

  const removeValue = (index: number) => {
    const newItems = values.items.filter((_, i) => i !== index);
    handleChange("items", newItems);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Our Values</CardTitle>
          <CardDescription>Edit the company values section</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="values-headline">Headline</Label>
            <Input
              id="values-headline"
              value={values.headline}
              onChange={(e) => handleChange("headline", e.target.value)}
              placeholder="Our values"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Values</Label>
              <Button type="button" variant="outline" size="sm" onClick={addValue}>
                <Plus className="w-4 h-4 mr-2" />
                Add Value
              </Button>
            </div>
            {values.items.map((value, index) => (
              <Card key={index}>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Value {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeValue(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={value.title}
                      onChange={(e) => updateValue(index, "title", e.target.value)}
                      placeholder="Value title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={value.description}
                      onChange={(e) => updateValue(index, "description", e.target.value)}
                      placeholder="Value description..."
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
