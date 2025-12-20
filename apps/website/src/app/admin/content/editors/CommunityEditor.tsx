"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BadgeCheck } from "lucide-react";

export function CommunityEditor() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card>
        <CardHeader>
          <CardTitle>Community Settings</CardTitle>
          <CardDescription>Manage the vendor grid display.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-md border p-4 bg-muted/30">
            <h3 className="font-medium mb-2">Automated Vendor Grid</h3>
            <p className="text-sm text-muted-foreground mb-4">
              The community section currently auto-generates 100 vendor profiles using a mix of stock images and random names to simulate a large network.
            </p>
            <div className="flex gap-2">
               <Button variant="outline" disabled>Regenerate Grid (Coming Soon)</Button>
               <Button variant="outline" disabled>Upload Custom Profiles</Button>
            </div>
          </div>

          <div className="flex items-center space-x-2 rounded-md border p-4">
            <BadgeCheck className="w-5 h-5 text-amber-500 fill-amber-500/10" />
            <div className="flex-1">
              <p className="text-sm font-medium leading-none">Verified Pro Badge</p>
              <p className="text-sm text-muted-foreground">Customize the verification badge appearance.</p>
            </div>
            <Button variant="ghost" size="sm">Edit Style</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
