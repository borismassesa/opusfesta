"use client"

import { useContent } from "@/context/ContentContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AboutEditor() {
  const { content, updateContent } = useContent();
  const { about } = content;

  const handleStatChange = (key: keyof typeof about.stats, value: string) => {
    updateContent("about", {
      stats: {
        ...about.stats,
        [key]: value
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card>
        <CardHeader>
          <CardTitle>About Statistics</CardTitle>
          <CardDescription>Update the impact numbers displayed in the About section.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Weddings Count Label</Label>
              <Input 
                value={about.stats.weddings} 
                onChange={(e) => handleStatChange("weddings", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Example: "Planned Weddings"</p>
            </div>
            
            <div className="space-y-2">
              <Label>Satisfaction Label</Label>
              <Input 
                value={about.stats.satisfaction} 
                onChange={(e) => handleStatChange("satisfaction", e.target.value)}
              />
               <p className="text-xs text-muted-foreground">Example: "User Satisfaction"</p>
            </div>

            <div className="space-y-2">
              <Label>Guests Count Label</Label>
              <Input 
                value={about.stats.guests} 
                onChange={(e) => handleStatChange("guests", e.target.value)}
              />
               <p className="text-xs text-muted-foreground">Example: "Happy Guests"</p>
            </div>

            <div className="space-y-2">
              <Label>Rating Label</Label>
              <Input 
                value={about.stats.rating} 
                onChange={(e) => handleStatChange("rating", e.target.value)}
              />
               <p className="text-xs text-muted-foreground">Example: "Average Rating"</p>
            </div>
          </div>
          
          <div className="rounded-md bg-muted p-4 text-sm text-muted-foreground">
            Note: The actual numbers (e.g., "15k+", "99%") are currently hardcoded for the demo. 
            This editor controls the labels. To make numbers dynamic, we would update the Content Schema.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
