"use client"

import { useState, useRef } from "react";
import { useContent, TestimonialItem } from "@/context/ContentContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Plus, Trash2, Upload, Star, X } from "lucide-react";
import { resolveAssetSrc } from "@/lib/assets";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";

export function TestimonialEditor() {
  const { content, updateContent } = useContent();
  const { testimonials } = content;
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [openAccordion, setOpenAccordion] = useState<string | undefined>(undefined);

  const handleTestimonialChange = (field: keyof typeof testimonials, value: any) => {
    updateContent("testimonials", { [field]: value });
  };

  const handleItemChange = (index: number, field: keyof TestimonialItem, value: string | number) => {
    const updatedItems = testimonials.items.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    updateContent("testimonials", { items: updatedItems });
  };

  const addTestimonial = () => {
    const newTestimonial: TestimonialItem = {
      id: `testimonial-${Date.now()}`,
      name: "New Testimonial",
      role: "Customer",
      avatar: "",
      content: "Testimonial content",
      rating: 5
    };
    const updatedItems = [...testimonials.items, newTestimonial];
    updateContent("testimonials", { items: updatedItems });
    setTimeout(() => {
      setOpenAccordion(newTestimonial.id);
      const element = document.querySelector(`[value="${newTestimonial.id}"]`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }, 150);
  };

  const removeTestimonial = (index: number) => {
    if (!confirm("Are you sure you want to delete this testimonial? This action cannot be undone.")) {
      return;
    }
    const testimonialToRemove = testimonials.items[index];
    const newItems = testimonials.items.filter((_, i) => i !== index);
    updateContent("testimonials", { items: newItems });
    if (openAccordion === testimonialToRemove.id) {
      setOpenAccordion(undefined);
    }
  };

  const uploadAvatar = async (index: number, file: File) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Image must be JPG, PNG, or WebP.", 4000);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB.", 4000);
      return;
    }

    const testimonial = testimonials.items[index];
    const testimonialName = testimonial.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const fileExt = file.name.split(".").pop();
    const fileName = `avatar-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `testimonials/${testimonialName}/${fileName}`;

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

      const updatedItems = [...testimonials.items];
      updatedItems[index] = {
        ...updatedItems[index],
        avatar: urlData.publicUrl
      };
      updateContent("testimonials", { items: updatedItems });

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
      uploadAvatar(index, file);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Testimonial Content */}
      <Card>
        <CardHeader>
          <CardTitle>Testimonial Content</CardTitle>
          <CardDescription>Update the header content for the Testimonials section.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Section Label</Label>
            <Input
              value={testimonials.label}
              onChange={(e) => handleTestimonialChange("label", e.target.value)}
              placeholder="Testimonials"
            />
            <p className="text-xs text-muted-foreground">
              Small label text displayed above the headline.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Headline</Label>
            <Input
              value={testimonials.headline}
              onChange={(e) => handleTestimonialChange("headline", e.target.value)}
              placeholder="Loved by couples"
            />
            <p className="text-xs text-muted-foreground">
              Main headline text (appears before the italic subheadline).
            </p>
          </div>

          <div className="space-y-2">
            <Label>Subheadline (Italic)</Label>
            <Input
              value={testimonials.subheadline}
              onChange={(e) => handleTestimonialChange("subheadline", e.target.value)}
              placeholder="& professionals."
            />
            <p className="text-xs text-muted-foreground">
              Subheadline text that appears in italic style.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={testimonials.description}
              onChange={(e) => handleTestimonialChange("description", e.target.value)}
              placeholder="Join thousands of happy users..."
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Description paragraph displayed in the header.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Testimonials */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Testimonials</CardTitle>
              <CardDescription>Manage the testimonials displayed in the Testimonials section.</CardDescription>
            </div>
            <Button onClick={addTestimonial} size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Testimonial
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {testimonials.items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="mb-4">No testimonials added yet.</p>
              <Button onClick={addTestimonial} variant="outline" size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Your First Testimonial
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
              {testimonials.items.map((testimonial, index) => {
                const imageSrc = testimonial.avatar ? resolveAssetSrc(testimonial.avatar) : "";
                const hasValidImage = imageSrc && imageSrc.trim() !== "" && (imageSrc.startsWith("http") || imageSrc.startsWith("https") || imageSrc.startsWith("data:"));

                return (
                  <AccordionItem key={testimonial.id} value={testimonial.id} className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3 flex-1">
                        {hasValidImage ? (
                          <img
                            src={imageSrc}
                            alt={testimonial.name}
                            className="w-12 h-12 rounded-full object-cover border border-border"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-muted border border-border flex items-center justify-center text-xs font-medium text-muted-foreground">
                            {testimonial.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="text-left flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{testimonial.name}</span>
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={12}
                                  className={i < testimonial.rating ? "fill-amber-400 text-amber-400" : "fill-border text-border/30"}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                          <div className="text-xs text-muted-foreground truncate mt-1">{testimonial.content.substring(0, 50)}...</div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Name</Label>
                          <Input
                            value={testimonial.name}
                            onChange={(e) => handleItemChange(index, "name", e.target.value)}
                            placeholder="John & Jane"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Role</Label>
                          <Input
                            value={testimonial.role}
                            onChange={(e) => handleItemChange(index, "role", e.target.value)}
                            placeholder="Married June 2024"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Rating</Label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <Button
                              key={rating}
                              variant={testimonial.rating >= rating ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleItemChange(index, "rating", rating)}
                              className="h-9 w-9 p-0"
                            >
                              <Star
                                size={16}
                                className={testimonial.rating >= rating ? "fill-amber-400 text-amber-400" : ""}
                              />
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Testimonial Content</Label>
                        <Textarea
                          value={testimonial.content}
                          onChange={(e) => handleItemChange(index, "content", e.target.value)}
                          placeholder="Testimonial text..."
                          rows={4}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Avatar</Label>
                        {hasValidImage ? (
                          <div className="relative w-32 h-32 rounded-full overflow-hidden border border-border bg-muted group mx-auto">
                            <img
                              src={imageSrc}
                              alt={testimonial.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleItemChange(index, "avatar", "")}
                              disabled={uploadingIndex === index}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                            {uploadingIndex === index && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              </div>
                            )}
                            <div
                              className={cn(
                                "absolute inset-0 flex flex-col items-center justify-center cursor-pointer transition-colors opacity-0 group-hover:opacity-100 bg-black/60 rounded-full",
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
                                    if (file) uploadAvatar(index, file);
                                  };
                                  document.body.appendChild(input);
                                  input.click();
                                  setTimeout(() => document.body.removeChild(input), 100);
                                }
                              }}
                            >
                              <Upload className="w-6 h-6 text-white mb-1" />
                              <p className="text-xs font-medium text-white text-center px-2">
                                Replace
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div
                            className={cn(
                              "w-full h-48 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors",
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
                                  if (file) uploadAvatar(index, file);
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
                                  Drag and drop an avatar here
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
                        <Button variant="destructive" size="sm" onClick={() => removeTestimonial(index)}>
                          <Trash2 className="w-4 h-4 mr-2" /> Delete Testimonial
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
