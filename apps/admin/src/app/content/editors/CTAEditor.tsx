"use client"

import { useState } from "react";
import { useContent } from "@/context/ContentContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X } from "lucide-react";
import { resolveAssetSrc } from "@/lib/assets";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";

export function CTAEditor() {
  const { content, updateContent } = useContent();
  const { cta } = content;
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const handleCTChange = (field: keyof typeof cta, value: any) => {
    updateContent("cta", { [field]: value });
  };

  const handleTrustIndicatorChange = (field: keyof typeof cta.trustIndicators, value: string) => {
    updateContent("cta", {
      trustIndicators: {
        ...cta.trustIndicators,
        [field]: value,
      },
    });
  };

  const uploadBackgroundImage = async (file: File) => {
    setUploadError(null);

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Image must be JPG, PNG, or WebP.", 4000);
      return;
    }

    const maxBytes = 10 * 1024 * 1024; // 10MB
    if (file.size > maxBytes) {
      toast.error("Image must be less than 10MB.", 4000);
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop() ?? "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const filePath = `cta/background-${fileName}`;

    try {
      const { error } = await supabase.storage
        .from("cms")
        .upload(filePath, file, {
          contentType: file.type,
          upsert: true,
        });

      if (error) {
        console.error("Upload error:", error);
        toast.error(`Failed to upload background image: ${error.message}`, 6000);
        setUploading(false);
        return;
      }

      const { data } = supabase.storage.from("cms").getPublicUrl(filePath);

      if (!data?.publicUrl) {
        toast.error("Failed to get image URL. Please try again.", 5000);
        setUploading(false);
        return;
      }

      handleCTChange("backgroundImage", data.publicUrl);
      toast.success("Background image uploaded successfully!", 4000);
      setUploading(false);
    } catch (error) {
      console.error("Unexpected error during upload:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to upload background image: ${errorMessage}`, 6000);
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadBackgroundImage(file);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card>
        <CardHeader>
          <CardTitle>Call to Action Section</CardTitle>
          <CardDescription>Manage the CTA section at the bottom of the homepage.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {uploadError && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {uploadError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Headline</Label>
              <Input 
                value={cta.headline} 
                onChange={(e) => handleCTChange("headline", e.target.value)}
                placeholder="Plan the wedding"
              />
            </div>
            <div className="space-y-2">
              <Label>Subheadline</Label>
              <Input 
                value={cta.subheadline} 
                onChange={(e) => handleCTChange("subheadline", e.target.value)}
                placeholder="of the century."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea 
              value={cta.description} 
              onChange={(e) => handleCTChange("description", e.target.value)}
              placeholder="Description text"
              className="min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Primary Button Text</Label>
              <Input 
                value={cta.primaryButtonText} 
                onChange={(e) => handleCTChange("primaryButtonText", e.target.value)}
                placeholder="Get Started"
              />
            </div>
            <div className="space-y-2">
              <Label>Primary Button Link</Label>
              <Input 
                value={cta.primaryButtonLink} 
                onChange={(e) => handleCTChange("primaryButtonLink", e.target.value)}
                placeholder="/signup"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Secondary Button Text</Label>
              <Input 
                value={cta.secondaryButtonText} 
                onChange={(e) => handleCTChange("secondaryButtonText", e.target.value)}
                placeholder="Live Demo"
              />
            </div>
            <div className="space-y-2">
              <Label>Secondary Button Link</Label>
              <Input 
                value={cta.secondaryButtonLink} 
                onChange={(e) => handleCTChange("secondaryButtonLink", e.target.value)}
                placeholder="/demo"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Trust Indicator - Couples</Label>
              <Input 
                value={cta.trustIndicators.couples} 
                onChange={(e) => handleTrustIndicatorChange("couples", e.target.value)}
                placeholder="Trusted by 50k+ Couples"
              />
            </div>
            <div className="space-y-2">
              <Label>Trust Indicator - Rating</Label>
              <Input 
                value={cta.trustIndicators.rating} 
                onChange={(e) => handleTrustIndicatorChange("rating", e.target.value)}
                placeholder="4.9/5 Rating"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Background Image</Label>
            {cta.backgroundImage && resolveAssetSrc(cta.backgroundImage) ? (
              <div className="relative w-full h-64 rounded-lg overflow-hidden border border-border bg-muted group">
                <img
                  src={resolveAssetSrc(cta.backgroundImage)}
                  alt="CTA Background"
                  className="w-full h-full object-cover"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleCTChange("backgroundImage", "")}
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </Button>
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                <div
                  className={cn(
                    "absolute inset-0 flex flex-col items-center justify-center cursor-pointer transition-colors opacity-0 group-hover:opacity-100 bg-black/60",
                    dragging && "opacity-100"
                  )}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!uploading) {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = "image/jpeg,image/png,image/webp";
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) uploadBackgroundImage(file);
                      };
                      document.body.appendChild(input);
                      input.click();
                      setTimeout(() => document.body.removeChild(input), 100);
                    }
                  }}
                >
                  <Upload className="w-8 h-8 text-white mb-2" />
                  <p className="text-sm font-medium text-white mb-1">
                    Click to replace image
                  </p>
                  <p className="text-xs text-white/80">
                    or drag and drop
                  </p>
                </div>
              </div>
            ) : (
              <div
                className={cn(
                  "w-full h-64 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors",
                  dragging
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-muted/50",
                  uploading && "opacity-50 cursor-not-allowed"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!uploading) {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/jpeg,image/png,image/webp";
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) uploadBackgroundImage(file);
                    };
                    document.body.appendChild(input);
                    input.click();
                    setTimeout(() => document.body.removeChild(input), 100);
                  }
                }}
              >
                {uploading ? (
                  <>
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
                    <p className="text-sm text-muted-foreground">Uploading...</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium text-foreground mb-1">
                      Drag and drop a background image here
                    </p>
                    <p className="text-xs text-muted-foreground">
                      or click to browse • Max 10MB
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      JPG, PNG, or WebP
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Preview Section */}
          <div className="mt-6 p-4 rounded-lg border border-border bg-muted/20">
            <Label className="text-sm font-medium mb-3 block">Live Preview</Label>
            <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden bg-zinc-900 shadow-lg">
              {/* Background Image */}
              {cta.backgroundImage ? (
                <img
                  src={resolveAssetSrc(cta.backgroundImage)}
                  alt="Preview Background"
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900" />
              )}
              {/* Overlays */}
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />
              
              {/* Content */}
              <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">
                  {cta.headline || "Plan the wedding"} <br />
                  <span className="font-serif italic font-normal text-white/90">
                    {cta.subheadline || "of the century."}
                  </span>
                </h3>
                <p className="text-sm md:text-base text-zinc-200 mb-6 max-w-md line-clamp-2">
                  {cta.description || "Join a community of modern couples..."}
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button size="sm" variant="secondary" className="text-xs md:text-sm">
                    {cta.primaryButtonText || "Get Started"}
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs md:text-sm border-white/30 text-white hover:bg-white/10">
                    {cta.secondaryButtonText || "Live Demo"}
                  </Button>
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-4 text-[10px] md:text-xs text-white/60 uppercase tracking-widest">
                  <span>{cta.trustIndicators.couples || "Trusted by 50k+ Couples"}</span>
                  <span>•</span>
                  <span>{cta.trustIndicators.rating || "4.9/5 Rating"}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
