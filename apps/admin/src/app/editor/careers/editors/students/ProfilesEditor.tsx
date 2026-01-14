"use client";

import { useStudentsContent } from "@/context/StudentsContentContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";

export function ProfilesEditor() {
  const { content, updateContent } = useStudentsContent();

  const addProfile = () => {
    updateContent((prev) => ({
      ...prev,
      profiles: [
        ...prev.profiles,
        {
          id: Math.max(...prev.profiles.map((p) => p.id), 0) + 1,
          name: "",
          image: "",
          role: "",
          quote: "",
          achievement: "",
        },
      ],
    }));
  };

  const removeProfile = (id: number) => {
    updateContent((prev) => ({
      ...prev,
      profiles: prev.profiles.filter((p) => p.id !== id),
    }));
  };

  const updateProfile = (id: number, field: string, value: string) => {
    updateContent((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) =>
        p.id === id ? { ...p, [field]: value } : p
      ),
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Student Profiles</h2>
          <p className="text-muted-foreground text-sm">
            Manage student profiles displayed in the carousel and testimonials
          </p>
        </div>
        <Button onClick={addProfile} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Profile
        </Button>
      </div>

      <div className="space-y-4">
        {content.profiles.map((profile) => (
          <Card key={profile.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Profile #{profile.id}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeProfile(profile.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={profile.name}
                    onChange={(e) => updateProfile(profile.id, "name", e.target.value)}
                    placeholder="Student Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input
                    value={profile.role || ""}
                    onChange={(e) => updateProfile(profile.id, "role", e.target.value)}
                    placeholder="Software Engineering Intern"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input
                  value={profile.image}
                  onChange={(e) => updateProfile(profile.id, "image", e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div className="space-y-2">
                <Label>CSS Filter (optional)</Label>
                <Input
                  value={profile.filter || ""}
                  onChange={(e) => updateProfile(profile.id, "filter", e.target.value)}
                  placeholder="grayscale(100%) contrast(120%)"
                />
              </div>

              <div className="space-y-2">
                <Label>Quote</Label>
                <Textarea
                  value={profile.quote || ""}
                  onChange={(e) => updateProfile(profile.id, "quote", e.target.value)}
                  placeholder="Student testimonial quote..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Achievement</Label>
                <Input
                  value={profile.achievement || ""}
                  onChange={(e) => updateProfile(profile.id, "achievement", e.target.value)}
                  placeholder="Led development of vendor search feature"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
