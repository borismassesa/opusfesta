"use client";

import { useStudentsContent } from "@/context/StudentsContentContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";

export function BenefitsEditor() {
  const { content, updateContent } = useStudentsContent();

  const addBenefit = () => {
    updateContent((prev) => ({
      ...prev,
      benefits: [
        ...prev.benefits,
        {
          title: "",
          description: "",
        },
      ],
    }));
  };

  const removeBenefit = (index: number) => {
    updateContent((prev) => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index),
    }));
  };

  const updateBenefit = (index: number, field: string, value: string) => {
    updateContent((prev) => ({
      ...prev,
      benefits: prev.benefits.map((benefit, i) =>
        i === index ? { ...benefit, [field]: value } : benefit
      ),
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Benefits</h2>
          <p className="text-muted-foreground text-sm">
            Manage the benefits section for students
          </p>
        </div>
        <Button onClick={addBenefit} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Benefit
        </Button>
      </div>

      <div className="space-y-4">
        {content.benefits.map((benefit, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Benefit #{index + 1}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeBenefit(index)}
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
                  value={benefit.title}
                  onChange={(e) => updateBenefit(index, "title", e.target.value)}
                  placeholder="Flexible Schedule"
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={benefit.description}
                  onChange={(e) => updateBenefit(index, "description", e.target.value)}
                  placeholder="We understand you have classes..."
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
