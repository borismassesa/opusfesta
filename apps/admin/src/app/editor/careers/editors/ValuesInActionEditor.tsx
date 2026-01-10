"use client";

import { useState } from "react";
import { useCareersContent } from "@/context/CareersContentContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";

export function ValuesInActionEditor() {
  const { content, updateContent } = useCareersContent();
  const { valuesInAction } = content;

  const handleChange = (field: string, value: any) => {
    updateContent((prev) => ({
      ...prev,
      valuesInAction: {
        ...prev.valuesInAction,
        [field]: value,
      },
    }));
  };

  const handleNestedChange = (section: string, field: string, value: any) => {
    updateContent((prev) => {
      const sectionValue = prev.valuesInAction[section as keyof typeof prev.valuesInAction];
      const sectionObj = (sectionValue && typeof sectionValue === 'object' && !Array.isArray(sectionValue)) 
        ? sectionValue as Record<string, any>
        : {} as Record<string, any>;
      
      return {
        ...prev,
        valuesInAction: {
          ...prev.valuesInAction,
          [section]: {
            ...sectionObj,
            [field]: value,
          },
        },
      };
    });
  };

  const addProgram = () => {
    updateContent((prev) => ({
      ...prev,
      valuesInAction: {
        ...prev.valuesInAction,
        socialImpact: {
          ...prev.valuesInAction.socialImpact,
          programs: [
            ...prev.valuesInAction.socialImpact.programs,
            {
              title: "",
              description: "",
            },
          ],
        },
      },
    }));
  };

  const updateProgram = (index: number, field: string, value: string) => {
    const newPrograms = [...valuesInAction.socialImpact.programs];
    newPrograms[index] = { ...newPrograms[index], [field]: value };
    handleNestedChange("socialImpact", "programs", newPrograms);
  };

  const removeProgram = (index: number) => {
    const newPrograms = valuesInAction.socialImpact.programs.filter((_, i) => i !== index);
    handleNestedChange("socialImpact", "programs", newPrograms);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Values in Action</CardTitle>
          <CardDescription>Edit the values in action section</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="via-headline">Headline</Label>
            <Input
              id="via-headline"
              value={valuesInAction.headline}
              onChange={(e) => handleChange("headline", e.target.value)}
              placeholder="Our values in action"
            />
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Affinity Groups</h3>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={valuesInAction.affinityGroups.title}
                onChange={(e) => handleNestedChange("affinityGroups", "title", e.target.value)}
                placeholder="Affinity groups"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={valuesInAction.affinityGroups.description}
                onChange={(e) => handleNestedChange("affinityGroups", "description", e.target.value)}
                placeholder="Enter description..."
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Nonprofits</h3>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={valuesInAction.nonprofits.title}
                onChange={(e) => handleNestedChange("nonprofits", "title", e.target.value)}
                placeholder="OpusFesta for Nonprofits"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={valuesInAction.nonprofits.description}
                onChange={(e) => handleNestedChange("nonprofits", "description", e.target.value)}
                placeholder="Enter description..."
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Social Impact</h3>
              <Button type="button" variant="outline" size="sm" onClick={addProgram}>
                <Plus className="w-4 h-4 mr-2" />
                Add Program
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={valuesInAction.socialImpact.title}
                onChange={(e) => handleNestedChange("socialImpact", "title", e.target.value)}
                placeholder="Social impact"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={valuesInAction.socialImpact.description}
                onChange={(e) => handleNestedChange("socialImpact", "description", e.target.value)}
                placeholder="Enter description..."
                rows={3}
              />
            </div>
            <div className="space-y-4">
              <Label>Programs</Label>
              {valuesInAction.socialImpact.programs.map((program, index) => (
                <Card key={index}>
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Program {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeProgram(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={program.title}
                        onChange={(e) => updateProgram(index, "title", e.target.value)}
                        placeholder="Program title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={program.description}
                        onChange={(e) => updateProgram(index, "description", e.target.value)}
                        placeholder="Program description..."
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
