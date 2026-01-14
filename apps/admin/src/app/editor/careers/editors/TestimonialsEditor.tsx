"use client";

import { useState } from "react";
import { useCareersContent } from "@/context/CareersContentContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";

export function TestimonialsEditor() {
  const { content, updateContent } = useCareersContent();
  const { testimonials } = content;

  const handleChange = (field: keyof typeof testimonials, value: any) => {
    updateContent((prev) => ({
      ...prev,
      testimonials: {
        ...prev.testimonials,
        [field]: value,
      },
    }));
  };

  const addTestimonial = () => {
    updateContent((prev) => ({
      ...prev,
      testimonials: {
        ...prev.testimonials,
        items: [
          ...prev.testimonials.items,
          {
            quote: "",
            name: "",
            role: "",
          },
        ],
      },
    }));
  };

  const updateTestimonial = (index: number, field: string, value: any) => {
    const newItems = [...testimonials.items];
    newItems[index] = { ...newItems[index], [field]: value };
    handleChange("items", newItems);
  };

  const removeTestimonial = (index: number) => {
    const newItems = testimonials.items.filter((_, i) => i !== index);
    handleChange("items", newItems);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Employee Testimonials</CardTitle>
          <CardDescription>Edit employee testimonials section</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="testimonials-headline">Headline</Label>
            <Input
              id="testimonials-headline"
              value={testimonials.headline}
              onChange={(e) => handleChange("headline", e.target.value)}
              placeholder="What our team says"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Testimonials</Label>
              <Button type="button" variant="outline" size="sm" onClick={addTestimonial}>
                <Plus className="w-4 h-4 mr-2" />
                Add Testimonial
              </Button>
            </div>
            {testimonials.items.map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Testimonial {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTestimonial(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label>Quote</Label>
                    <Textarea
                      value={testimonial.quote}
                      onChange={(e) => updateTestimonial(index, "quote", e.target.value)}
                      placeholder="Enter testimonial quote..."
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        value={testimonial.name}
                        onChange={(e) => updateTestimonial(index, "name", e.target.value)}
                        placeholder="Employee name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Input
                        value={testimonial.role}
                        onChange={(e) => updateTestimonial(index, "role", e.target.value)}
                        placeholder="Job title"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
