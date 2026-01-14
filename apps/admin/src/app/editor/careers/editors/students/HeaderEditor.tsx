"use client";

import { useStudentsContent } from "@/context/StudentsContentContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function HeaderEditor() {
  const { content, updateContent } = useStudentsContent();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Header Section</h2>
        <p className="text-muted-foreground text-sm">
          Edit the hero header section of the students page
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Header Content</CardTitle>
          <CardDescription>
            Configure the main header text and description
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="header-label">Label</Label>
            <Input
              id="header-label"
              value={content.header.label}
              onChange={(e) =>
                updateContent((prev) => ({
                  ...prev,
                  header: { ...prev.header, label: e.target.value },
                }))
              }
              placeholder="Meet Our Students"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="header-title">Title</Label>
            <Input
              id="header-title"
              value={content.header.title}
              onChange={(e) =>
                updateContent((prev) => ({
                  ...prev,
                  header: { ...prev.header, title: e.target.value },
                }))
              }
              placeholder="Meet Our Students"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="header-description">Description</Label>
            <Textarea
              id="header-description"
              value={content.header.description}
              onChange={(e) =>
                updateContent((prev) => ({
                  ...prev,
                  header: { ...prev.header, description: e.target.value },
                }))
              }
              placeholder="Join a community of talented students..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
