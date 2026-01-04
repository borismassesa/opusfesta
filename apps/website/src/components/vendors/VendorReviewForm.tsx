"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Star, X, Upload, Image as ImageIcon, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";
import type { Vendor } from "@/lib/supabase/vendors";

interface VendorReviewFormProps {
  vendor: Vendor;
  inquiryId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function VendorReviewForm({ vendor, inquiryId, onSuccess, onCancel }: VendorReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [eventType, setEventType] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + imageFiles.length > 5) {
      setError("You can upload a maximum of 5 images");
      return;
    }

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        setError("Only image files are allowed");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prev) => [...prev, reader.result as string]);
        setImageFiles((prev) => [...prev, file]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (rating === 0) {
        setError("Please select a rating");
        setIsSubmitting(false);
        return;
      }

      if (!content.trim()) {
        setError("Please write a review");
        setIsSubmitting(false);
        return;
      }

      // Get authentication token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
        return;
      }

      // Upload images to Supabase storage if any
      let uploadedImageUrls: string[] = [];
      if (imageFiles.length > 0) {
        // TODO: Upload to Supabase storage bucket
        // For now, we'll use data URLs (not ideal for production)
        // In production, upload to Supabase storage and get public URLs
        uploadedImageUrls = images; // Temporary - use data URLs
      }

      // Submit review
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          vendorId: vendor.id,
          inquiryId: inquiryId,
          rating,
          title: title.trim() || undefined,
          content: content.trim(),
          images: uploadedImageUrls.length > 0 ? uploadedImageUrls : undefined,
          eventType: eventType || undefined,
          eventDate: eventDate || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
          return;
        }
        throw new Error(data.error || "Failed to submit review");
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        // Reset form
        setRating(0);
        setTitle("");
        setContent("");
        setImages([]);
        setImageFiles([]);
        setEventType("");
        setEventDate("");
        setSuccess(false);
      }, 2000);
    } catch (err) {
      console.error("Error submitting review:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Review Submitted!</h3>
        <p className="text-secondary">
          Your review has been submitted and is pending moderation.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Rating */}
      <div>
        <Label className="text-base font-semibold mb-3 block">Rating *</Label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="focus:outline-none transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 ${
                  star <= (hoveredRating || rating)
                    ? "text-amber-500 fill-amber-500"
                    : "text-secondary/30"
                }`}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm text-secondary">
              {rating} {rating === 1 ? "star" : "stars"}
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <div>
        <Label htmlFor="review-title" className="text-base font-semibold mb-2 block">
          Review Title (Optional)
        </Label>
        <Input
          id="review-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience"
          maxLength={100}
          className="border-border"
        />
      </div>

      {/* Review Content */}
      <div>
        <Label htmlFor="review-content" className="text-base font-semibold mb-2 block">
          Your Review *</Label>
        <Textarea
          id="review-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your experience with this vendor..."
          required
          rows={6}
          maxLength={2000}
          className="border-border resize-none"
        />
        <div className="text-xs text-secondary mt-1 text-right">
          {content.length}/2000 characters
        </div>
      </div>

      {/* Event Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="event-type" className="text-base font-semibold mb-2 block">
            Event Type (Optional)
          </Label>
          <Input
            id="event-type"
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            placeholder="e.g., Wedding, Engagement"
            className="border-border"
          />
        </div>
        <div>
          <Label htmlFor="event-date" className="text-base font-semibold mb-2 block">
            Event Date (Optional)
          </Label>
          <Input
            id="event-date"
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="border-border"
          />
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <Label className="text-base font-semibold mb-2 block">
          Photos (Optional, up to 5)
        </Label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="w-full border-border"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Photos
        </Button>
        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mt-4">
            {images.map((img, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-border">
                <img
                  src={img}
                  alt={`Review photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 p-1 bg-background/90 rounded-full hover:bg-background transition-colors"
                >
                  <X className="w-4 h-4 text-foreground" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm">
          <XCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Submit Buttons */}
      <div className="flex gap-3">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 border-border"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          className="flex-1 bg-primary text-primary-foreground"
          disabled={isSubmitting || rating === 0 || !content.trim()}
        >
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </Button>
      </div>

      <p className="text-xs text-secondary text-center">
        Your review will be moderated before being published.
      </p>
    </form>
  );
}
