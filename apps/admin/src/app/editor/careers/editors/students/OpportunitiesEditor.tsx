"use client";

import { useStudentsContent } from "@/context/StudentsContentContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ICON_OPTIONS = [
  { value: "GraduationCap", label: "Graduation Cap" },
  { value: "Briefcase", label: "Briefcase" },
  { value: "Lightbulb", label: "Lightbulb" },
  { value: "Users", label: "Users" },
  { value: "BookOpen", label: "Book Open" },
  { value: "Code", label: "Code" },
];

export function OpportunitiesEditor() {
  const { content, updateContent } = useStudentsContent();

  const addOpportunity = () => {
    updateContent((prev) => ({
      ...prev,
      opportunities: [
        ...prev.opportunities,
        {
          icon: "GraduationCap",
          title: "",
          description: "",
        },
      ],
    }));
  };

  const removeOpportunity = (index: number) => {
    updateContent((prev) => ({
      ...prev,
      opportunities: prev.opportunities.filter((_, i) => i !== index),
    }));
  };

  const updateOpportunity = (index: number, field: string, value: string) => {
    updateContent((prev) => ({
      ...prev,
      opportunities: prev.opportunities.map((opp, i) =>
        i === index ? { ...opp, [field]: value } : opp
      ),
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Opportunities</h2>
          <p className="text-muted-foreground text-sm">
            Manage the opportunities section for students
          </p>
        </div>
        <Button onClick={addOpportunity} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Opportunity
        </Button>
      </div>

      <div className="space-y-4">
        {content.opportunities.map((opportunity, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Opportunity #{index + 1}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeOpportunity(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Icon</Label>
                <Select
                  value={opportunity.icon}
                  onValueChange={(value) => updateOpportunity(index, "icon", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select icon" />
                  </SelectTrigger>
                  <SelectContent>
                    {ICON_OPTIONS.map((icon) => (
                      <SelectItem key={icon.value} value={icon.value}>
                        {icon.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={opportunity.title}
                  onChange={(e) => updateOpportunity(index, "title", e.target.value)}
                  placeholder="Internships"
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={opportunity.description}
                  onChange={(e) => updateOpportunity(index, "description", e.target.value)}
                  placeholder="Gain real-world experience..."
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
