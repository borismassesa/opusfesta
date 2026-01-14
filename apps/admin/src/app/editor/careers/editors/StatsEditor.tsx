"use client";

import { useCareersContent } from "@/context/CareersContentContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function StatsEditor() {
  const { content, updateContent } = useCareersContent();
  const { stats } = content;

  const handleChange = (field: keyof typeof stats, value: string) => {
    updateContent((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        [field]: value,
      },
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Key Stats</CardTitle>
          <CardDescription>Edit the statistics displayed on the careers page</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stats-team">Team Members</Label>
              <Input
                id="stats-team"
                value={stats.teamMembers}
                onChange={(e) => handleChange("teamMembers", e.target.value)}
                placeholder="50+"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stats-positions">Open Positions</Label>
              <Input
                id="stats-positions"
                value={stats.openPositions}
                onChange={(e) => handleChange("openPositions", e.target.value)}
                placeholder="10+"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stats-locations">Locations</Label>
              <Input
                id="stats-locations"
                value={stats.locations}
                onChange={(e) => handleChange("locations", e.target.value)}
                placeholder="3"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stats-founded">Founded</Label>
              <Input
                id="stats-founded"
                value={stats.founded}
                onChange={(e) => handleChange("founded", e.target.value)}
                placeholder="2023"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
