"use client";

import { useCareersContent } from "@/context/CareersContentContext";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/careers/ImageUpload";

export function DiversityEditor() {
  const { content, updateContent } = useCareersContent();
  const { diversity } = content;

  const handleChange = (field: keyof typeof diversity, value: any) => {
    updateContent((prev) => ({
      ...prev,
      diversity: {
        ...prev.diversity,
        [field]: value,
      },
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Diversity & Inclusion</CardTitle>
          <CardDescription>Edit the diversity and inclusion quote section</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="diversity-quote">Quote</Label>
            <Textarea
              id="diversity-quote"
              value={diversity.quote}
              onChange={(e) => handleChange("quote", e.target.value)}
              placeholder="Enter diversity quote..."
              rows={6}
            />
          </div>

          <div className="space-y-2">
            <Label>Background Image</Label>
            <ImageUpload
              value={diversity.backgroundImage}
              onChange={(url) => handleChange("backgroundImage", url)}
              folder="careers-diversity"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
