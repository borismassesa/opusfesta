"use client";

import { useState } from "react";
import { useCareersContent } from "@/context/CareersContentContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/careers/ImageUpload";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";

export function HeroEditor() {
  const { content, updateContent } = useCareersContent();
  const { hero } = content;

  const handleChange = (field: keyof typeof hero, value: any) => {
    updateContent((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        [field]: value,
      },
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Hero Section</CardTitle>
          <CardDescription>Edit the main hero section of the careers page</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hero-title">Title</Label>
            <Input
              id="hero-title"
              value={hero.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Careers at OpusFesta"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hero-description">Description</Label>
            <Textarea
              id="hero-description"
              value={hero.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Enter description..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hero-button-text">Button Text</Label>
              <Input
                id="hero-button-text"
                value={hero.buttonText}
                onChange={(e) => handleChange("buttonText", e.target.value)}
                placeholder="Browse full-time openings"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hero-button-link">Button Link</Label>
              <Input
                id="hero-button-link"
                value={hero.buttonLink}
                onChange={(e) => handleChange("buttonLink", e.target.value)}
                placeholder="/careers/positions"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Hero Image (Legacy)</Label>
            <ImageUpload
              value={hero.image}
              onChange={(url) => handleChange("image", url)}
              folder="careers-hero"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Carousel Images (3D Carousel)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const newImages = [...(hero.carouselImages || []), ""];
                  handleChange("carouselImages", newImages);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Image
              </Button>
            </div>
            {hero.carouselImages && hero.carouselImages.length > 0 ? (
              <div className="space-y-4">
                {hero.carouselImages.map((imageUrl, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Image {index + 1}</h4>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const newImages = [...hero.carouselImages];
                              if (index > 0) {
                                [newImages[index], newImages[index - 1]] = [newImages[index - 1], newImages[index]];
                                handleChange("carouselImages", newImages);
                              }
                            }}
                            disabled={index === 0}
                          >
                            <ArrowUp className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const newImages = [...hero.carouselImages];
                              if (index < newImages.length - 1) {
                                [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
                                handleChange("carouselImages", newImages);
                              }
                            }}
                            disabled={index === hero.carouselImages.length - 1}
                          >
                            <ArrowDown className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const newImages = hero.carouselImages.filter((_, i) => i !== index);
                              handleChange("carouselImages", newImages);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Image URL</Label>
                        <Input
                          value={imageUrl}
                          onChange={(e) => {
                            const newImages = [...hero.carouselImages];
                            newImages[index] = e.target.value;
                            handleChange("carouselImages", newImages);
                          }}
                          placeholder="https://images.unsplash.com/..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Or Upload Image</Label>
                        <ImageUpload
                          value={imageUrl || null}
                          onChange={(url) => {
                            const newImages = [...hero.carouselImages];
                            newImages[index] = url || "";
                            handleChange("carouselImages", newImages);
                          }}
                          folder="careers-hero-carousel"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No carousel images. Click "Add Image" to add one.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
