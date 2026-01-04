"use client"

import { useState, useRef } from "react";
import { useContent, CommunityVendor } from "@/context/ContentContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Trash2, Plus, Upload, X } from "lucide-react";
import { resolveAssetSrc } from "@/lib/assets";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";

export function CommunityEditor() {
  const { content, updateContent } = useContent();
  const { community } = content;
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [openAccordion, setOpenAccordion] = useState<string | undefined>(undefined);

  const handleCommunityChange = (field: keyof typeof community, value: any) => {
    updateContent("community", { [field]: value });
  };

  const handleVendorChange = (index: number, field: keyof CommunityVendor, value: string | number) => {
    const updatedVendors = community.vendors.map((v, i) => 
      i === index ? { ...v, [field]: value } : v
    );
    updateContent("community", { vendors: updatedVendors });
  };

  const addVendor = () => {
    const newVendor: CommunityVendor = {
      id: `vendor-${Date.now()}`,
      name: "New Vendor",
      role: "Photographer",
      quote: "Capturing moments that last a lifetime.",
      avatar: "",
      rating: 5
    };
    const updatedVendors = [...community.vendors, newVendor];
    updateContent("community", { vendors: updatedVendors });
    setTimeout(() => {
      setOpenAccordion(newVendor.id);
      const element = document.querySelector(`[value="${newVendor.id}"]`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }, 150);
  };

  const removeVendor = (index: number) => {
    if (!confirm("Are you sure you want to delete this vendor? This action cannot be undone.")) {
      return;
    }
    const vendorToRemove = community.vendors[index];
    const newVendors = community.vendors.filter((_, i) => i !== index);
    updateContent("community", { vendors: newVendors });
    if (openAccordion === vendorToRemove.id) {
      setOpenAccordion(undefined);
    }
  };

  const uploadVendorAvatar = async (index: number, file: File) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Image must be JPG, PNG, or WebP.", 4000);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB.", 4000);
      return;
    }

    const vendor = community.vendors[index];
    const vendorName = vendor.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const fileExt = file.name.split(".").pop();
    const fileName = `avatar-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `community/vendors/${vendorName}/${fileName}`;

    setUploadingIndex(index);

    try {
      const { error: uploadError } = await supabase.storage
        .from("cms")
        .upload(filePath, file, {
          contentType: file.type,
          upsert: true,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        toast.error(`Failed to upload avatar: ${uploadError.message}`, 6000);
        setUploadingIndex(null);
        return;
      }

      const { data: urlData } = supabase.storage.from("cms").getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        toast.error("Failed to get avatar URL. Please try again.", 5000);
        setUploadingIndex(null);
        return;
      }

      const updatedVendors = [...community.vendors];
      updatedVendors[index] = {
        ...updatedVendors[index],
        avatar: urlData.publicUrl
      };
      updateContent("community", { vendors: updatedVendors });

      toast.success("Avatar uploaded successfully!", 4000);
      setUploadingIndex(null);
    } catch (error) {
      console.error("Unexpected error during upload:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to upload avatar: ${errorMessage}`, 6000);
      setUploadingIndex(null);
    }
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingIndex(index);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingIndex(null);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingIndex(null);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadVendorAvatar(index, file);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Community Content */}
      <Card>
        <CardHeader>
          <CardTitle>Community Content</CardTitle>
          <CardDescription>Update the headline, description, and call-to-action buttons for the Community section.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Headline</Label>
            <Input
              value={community.headline}
              onChange={(e) => handleCommunityChange("headline", e.target.value)}
              placeholder="Connecting you with"
            />
            <p className="text-xs text-muted-foreground">
              Main headline text (appears before the italic subheadline).
            </p>
          </div>

          <div className="space-y-2">
            <Label>Subheadline (Italic)</Label>
            <Input
              value={community.subheadline}
              onChange={(e) => handleCommunityChange("subheadline", e.target.value)}
              placeholder="top-tier professionals."
            />
            <p className="text-xs text-muted-foreground">
              Subheadline text that appears in italic style.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={community.description}
              onChange={(e) => handleCommunityChange("description", e.target.value)}
              placeholder="From award-winning photographers to master florists..."
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Description paragraph displayed below the headline.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
            <div className="space-y-2">
              <Label>Primary Button Text</Label>
              <Input
                value={community.primaryButtonText}
                onChange={(e) => handleCommunityChange("primaryButtonText", e.target.value)}
                placeholder="Find Vendors"
              />
            </div>
            <div className="space-y-2">
              <Label>Primary Button Link</Label>
              <Input
                value={community.primaryButtonLink}
                onChange={(e) => handleCommunityChange("primaryButtonLink", e.target.value)}
                placeholder="/vendors"
              />
            </div>
            <div className="space-y-2">
              <Label>Secondary Button Text</Label>
              <Input
                value={community.secondaryButtonText}
                onChange={(e) => handleCommunityChange("secondaryButtonText", e.target.value)}
                placeholder="Join as a Pro"
              />
            </div>
            <div className="space-y-2">
              <Label>Secondary Button Link</Label>
              <Input
                value={community.secondaryButtonLink}
                onChange={(e) => handleCommunityChange("secondaryButtonLink", e.target.value)}
                placeholder="/vendor-signup"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vendors */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Vendors</CardTitle>
              <CardDescription>Manage the vendor profiles displayed in the community grid.</CardDescription>
            </div>
            <Button onClick={addVendor} size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Vendor
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {community.vendors.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="mb-4">No vendors added yet.</p>
              <Button onClick={addVendor} variant="outline" size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Your First Vendor
              </Button>
            </div>
          ) : (
            <Accordion
              type="single"
              collapsible
              value={openAccordion}
              onValueChange={setOpenAccordion}
              className="space-y-2"
            >
              {community.vendors.map((vendor, index) => {
                const imageSrc = vendor.avatar ? resolveAssetSrc(vendor.avatar) : "";
                const hasValidImage = imageSrc && imageSrc.trim() !== "" && (imageSrc.startsWith("http") || imageSrc.startsWith("https") || imageSrc.startsWith("data:"));

                return (
                  <AccordionItem key={vendor.id} value={vendor.id} className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3 flex-1">
                        {hasValidImage ? (
                          <img
                            src={imageSrc}
                            alt={vendor.name}
                            className="w-10 h-10 rounded-full object-cover border border-border"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center text-xs font-medium text-muted-foreground">
                            {vendor.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="text-left">
                          <div className="font-medium">{vendor.name}</div>
                          <div className="text-xs text-muted-foreground">{vendor.role}</div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Name</Label>
                          <Input
                            value={vendor.name}
                            onChange={(e) => handleVendorChange(index, "name", e.target.value)}
                            placeholder="John D."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Role</Label>
                          <Input
                            value={vendor.role}
                            onChange={(e) => handleVendorChange(index, "role", e.target.value)}
                            placeholder="Photographer"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Quote</Label>
                        <Textarea
                          value={vendor.quote}
                          onChange={(e) => handleVendorChange(index, "quote", e.target.value)}
                          placeholder="Capturing moments that last a lifetime."
                          rows={2}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Rating</Label>
                        <Input
                          type="number"
                          min="0"
                          max="5"
                          step="0.1"
                          value={vendor.rating}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            if (!isNaN(value) && value >= 0 && value <= 5) {
                              handleVendorChange(index, "rating", value.toString());
                            }
                          }}
                          placeholder="5.0"
                        />
                        <p className="text-xs text-muted-foreground">
                          Rating from 0 to 5 (e.g., 4.8, 5.0)
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>Avatar Image</Label>
                        {hasValidImage ? (
                          <div className="relative w-full h-32 rounded-lg overflow-hidden border border-border bg-muted group">
                            <img
                              src={imageSrc}
                              alt={vendor.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleVendorChange(index, "avatar", "")}
                              disabled={uploadingIndex === index}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            {uploadingIndex === index && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              </div>
                            )}
                            <div
                              className={cn(
                                "absolute inset-0 flex flex-col items-center justify-center cursor-pointer transition-colors opacity-0 group-hover:opacity-100 bg-black/60",
                                draggingIndex === index && "opacity-100"
                              )}
                              onDragOver={(e) => handleDragOver(e, index)}
                              onDragLeave={handleDragLeave}
                              onDrop={(e) => handleDrop(e, index)}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (uploadingIndex !== index) {
                                  const input = document.createElement("input");
                                  input.type = "file";
                                  input.accept = "image/jpeg,image/png,image/webp";
                                  input.onchange = (e) => {
                                    const file = (e.target as HTMLInputElement).files?.[0];
                                    if (file) uploadVendorAvatar(index, file);
                                  };
                                  document.body.appendChild(input);
                                  input.click();
                                  setTimeout(() => document.body.removeChild(input), 100);
                                }
                              }}
                            >
                              <Upload className="w-6 h-6 text-white mb-1" />
                              <p className="text-xs font-medium text-white">
                                Click to replace
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div
                            className={cn(
                              "w-full h-32 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors",
                              draggingIndex === index
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50 hover:bg-muted/50",
                              uploadingIndex === index && "opacity-50 cursor-not-allowed"
                            )}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, index)}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (uploadingIndex !== index) {
                                const input = document.createElement("input");
                                input.type = "file";
                                input.accept = "image/jpeg,image/png,image/webp";
                                input.onchange = (e) => {
                                  const file = (e.target as HTMLInputElement).files?.[0];
                                  if (file) uploadVendorAvatar(index, file);
                                };
                                document.body.appendChild(input);
                                input.click();
                                setTimeout(() => document.body.removeChild(input), 100);
                              }
                            }}
                          >
                            {uploadingIndex === index ? (
                              <>
                                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
                                <p className="text-sm text-muted-foreground">Uploading...</p>
                              </>
                            ) : (
                              <>
                                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                                <p className="text-sm font-medium text-foreground mb-1">
                                  Drag and drop an image here
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  or click to browse • Max 5MB • JPG, PNG, or WebP
                                </p>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end pt-2">
                        <Button variant="destructive" size="sm" onClick={() => removeVendor(index)}>
                          <Trash2 className="w-4 h-4 mr-2" /> Delete Vendor
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
