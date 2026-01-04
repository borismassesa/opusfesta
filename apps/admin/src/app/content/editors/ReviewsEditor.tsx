"use client"

import { useState } from "react";
import { useContent, ReviewItem } from "@/context/ContentContext";
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

export function ReviewsEditor() {
  const { content, updateContent } = useContent();
  const { reviews } = content;
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  const handleReviewChange = (index: number, field: keyof ReviewItem, value: any) => {
    const newReviews = [...reviews];
    newReviews[index] = { ...newReviews[index], [field]: value };
    updateContent("reviews", newReviews);
  };

  const addReview = () => {
    const newReview: ReviewItem = {
      id: Date.now(),
      name: "New Reviewer",
      role: "Customer",
      avatar: "",
      content: "Review content",
      rating: 5,
    };
    updateContent("reviews", [...reviews, newReview]);
  };

  const removeReview = (index: number) => {
    const newReviews = reviews.filter((_, i) => i !== index);
    updateContent("reviews", newReviews);
  };

  const uploadAvatar = async (index: number, file: File) => {
    setUploadError(null);

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setUploadError("Avatar must be JPG, PNG, or WebP.");
      return;
    }

    const maxBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxBytes) {
      setUploadError("Avatar must be <= 5MB.");
      return;
    }

    const reviewId = reviews[index]?.id ?? Date.now();
    const ext = file.name.split(".").pop() ?? "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const filePath = `reviews/${reviewId}/avatar-${fileName}`;

    setUploadingId(reviewId);

    const { error } = await supabase.storage
      .from("cms")
      .upload(filePath, file, {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      setUploadError(error.message);
      setUploadingId(null);
      return;
    }

    const { data } = supabase.storage.from("cms").getPublicUrl(filePath);
    handleReviewChange(index, "avatar", data.publicUrl);
    setUploadingId(null);
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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Customer Reviews</CardTitle>
            <CardDescription>Manage the reviews displayed on the homepage.</CardDescription>
          </div>
          <Button onClick={addReview} size="sm">
            <Plus className="w-4 h-4 mr-2" /> Add Review
          </Button>
        </CardHeader>
        <CardContent>
          {uploadError && (
            <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {uploadError}
            </div>
          )}
          <Accordion type="single" collapsible className="w-full space-y-4">
            {reviews.map((review, index) => (
              <AccordionItem key={review.id} value={`review-${review.id}`} className="border border-border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-4 text-left w-full">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex-shrink-0 border border-border">
                      {review.avatar ? (
                        <img
                          src={resolveAssetSrc(review.avatar)}
                          alt={review.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <span className="text-xs text-muted-foreground">
                            {review.name.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{review.name}</span>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              className={i < review.rating ? "fill-amber-400 text-amber-400" : "fill-border text-border/30"}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground truncate">{review.role}</span>
                      <span className="text-xs text-muted-foreground truncate mt-1">{review.content.substring(0, 50)}...</span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 pb-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input 
                        value={review.name} 
                        onChange={(e) => handleReviewChange(index, 'name', e.target.value)}
                        placeholder="Reviewer name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Input 
                        value={review.role} 
                        onChange={(e) => handleReviewChange(index, 'role', e.target.value)}
                        placeholder="e.g., Married June 2024, Photographer"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Rating</Label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <Button
                          key={rating}
                          variant={review.rating >= rating ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleReviewChange(index, "rating", rating)}
                          className="h-9 w-9 p-0"
                        >
                          <Star
                            size={16}
                            className={review.rating >= rating ? "fill-amber-400 text-amber-400" : ""}
                          />
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Review Content</Label>
                    <Textarea 
                      value={review.content} 
                      onChange={(e) => handleReviewChange(index, 'content', e.target.value)}
                      placeholder="Review text"
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Avatar</Label>
                    {review.avatar && resolveAssetSrc(review.avatar) ? (
                      <div className="relative w-32 h-32 rounded-full overflow-hidden border border-border bg-muted group mx-auto">
                        <img
                          src={resolveAssetSrc(review.avatar)}
                          alt={review.name}
                          className="w-full h-full object-cover"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleReviewChange(index, "avatar", "")}
                          disabled={uploadingId === review.id}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        {uploadingId === review.id && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                        <div
                          className={cn(
                            "absolute inset-0 flex flex-col items-center justify-center cursor-pointer transition-colors opacity-0 group-hover:opacity-100 bg-black/60 rounded-full",
                            draggingIndex === index && "opacity-100"
                          )}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDraggingIndex(index);
                          }}
                          onDragLeave={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDraggingIndex(null);
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDraggingIndex(null);
                            const file = e.dataTransfer.files?.[0];
                            if (file) uploadAvatar(index, file);
                          }}
                          onClick={() => {
                            if (!uploadingId) {
                              const input = document.createElement("input");
                              input.type = "file";
                              input.accept = "image/jpeg,image/png,image/webp";
                              input.onchange = (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0];
                                if (file) uploadAvatar(index, file);
                              };
                              input.click();
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
                          uploadingId === review.id && "opacity-50 cursor-not-allowed"
                        )}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, index)}
                        onClick={() => {
                          if (!uploadingId) {
                            const input = document.createElement("input");
                            input.type = "file";
                            input.accept = "image/jpeg,image/png,image/webp";
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) uploadAvatar(index, file);
                            };
                            input.click();
                          }
                        }}
                      >
                        {uploadingId === review.id ? (
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
                              or click to browse • Max 5MB
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              JPG, PNG, or WebP
                            </p>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button variant="destructive" size="sm" onClick={() => removeReview(index)}>
                      <Trash2 className="w-4 h-4 mr-2" /> Delete Review
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
