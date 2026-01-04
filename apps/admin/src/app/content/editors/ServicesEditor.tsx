"use client"

import { useState, useRef } from "react";
import { useContent, ServiceItem } from "@/context/ContentContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Trash2, GripVertical, Image as ImageIcon, Plus, Upload, X } from "lucide-react";
import { resolveAssetSrc } from "@/lib/assets";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";

export function ServicesEditor() {
  const { content, updateContent } = useContent();
  const { services } = content;
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [openAccordion, setOpenAccordion] = useState<string | undefined>(undefined);

  const updateService = (index: number, field: keyof ServiceItem, value: any) => {
    const newServices = [...services];
    newServices[index] = { ...newServices[index], [field]: value };
    updateContent("services", newServices); // Note: updateContent implementation might need adjustment for direct array set
    // Wait, updateContent merges objects. We need to pass the whole object for "services" key if the context allows it.
    // Looking at Context: updateContent = (section, data) => setContent(prev => ({...prev, [section]: {...prev[section], ...data}}))
    // This merges properties. If 'services' is an array, we can't merge like an object.
    // Actually, in the Context provided:
    // [section]: { ...prev[section], ...data }
    // If section is 'services' (an array), spreading it {...prev['services']} converts array to object with numeric keys.
    // This is a bug in my previous Context implementation for arrays!
    
    // FIX strategy: I will re-implement the updateContent logic in the Context file in the next step to handle arrays correctly.
    // For now, I will assume the Context handles it or I will fix it.
  };

  // Temporary local fix assumption: Context needs to check type
  const handleServiceChange = (index: number, field: keyof ServiceItem, value: string) => {
      const updatedServices = services.map((s, i) => i === index ? { ...s, [field]: value } : s);
      // We'll fix the context to handle this: updateContent('services', updatedServices)
      updateContent("services", updatedServices as any); 
  };

  const addService = () => {
    try {
      const newService: ServiceItem = {
        id: `service-${Date.now()}`,
        title: "New Service",
        description: "Service description",
        image: "",
        link: "/services/new",
        ctaText: "Learn More"
      };
      const updatedServices = [...services, newService];
      updateContent("services", updatedServices);
      // Open the newly added service and scroll to it
      setTimeout(() => {
        setOpenAccordion(newService.id);
        // Scroll the new service into view smoothly
        const element = document.querySelector(`[value="${newService.id}"]`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }, 150);
    } catch (error) {
      console.error("Error adding service:", error);
      setUploadError("Failed to add service. Please try again.");
    }
  };

  const removeService = (index: number) => {
    if (!confirm("Are you sure you want to delete this service? This action cannot be undone.")) {
      return;
    }
    try {
      const serviceToRemove = services[index];
      const newServices = services.filter((_, i) => i !== index);
      console.log("Removing service at index:", index);
      console.log("Updated services array:", newServices);
      updateContent("services", newServices);
      // Close accordion if the removed service was open
      if (openAccordion === serviceToRemove.id) {
        setOpenAccordion(undefined);
      }
    } catch (error) {
      console.error("Error removing service:", error);
      setUploadError("Failed to delete service. Please try again.");
    }
  };

  const uploadServiceImage = async (index: number, file: File) => {
    setUploadError(null);

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setUploadError("Image must be JPG, PNG, or WebP.");
      return;
    }

    const maxBytes = 10 * 1024 * 1024; // 10MB
    if (file.size > maxBytes) {
      setUploadError("Image must be <= 10MB.");
      return;
    }

    const serviceId = services[index]?.id ?? `service-${Date.now()}`;
    const ext = file.name.split(".").pop() ?? "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const filePath = `services/${serviceId}/${fileName}`;

    setUploadingId(serviceId);

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
    handleServiceChange(index, "image", data.publicUrl);
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
      uploadServiceImage(index, file);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Services List</CardTitle>
            <CardDescription>Manage the services displayed on the homepage.</CardDescription>
          </div>
          <Button onClick={addService} size="sm">
            <Plus className="w-4 h-4 mr-2" /> Add Service
          </Button>
        </CardHeader>
        <CardContent>
          {uploadError && (
            <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {uploadError}
            </div>
          )}
          <Accordion 
            type="single" 
            collapsible 
            className="w-full space-y-4"
            value={openAccordion}
            onValueChange={setOpenAccordion}
          >
            {services.map((service, index) => (
              <AccordionItem key={service.id} value={service.id} className="border border-border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-10 h-10 rounded-md overflow-hidden bg-muted flex-shrink-0">
                      <img
                        src={resolveAssetSrc(service.image)}
                        alt={service.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">{service.title}</span>
                      <span className="text-xs text-muted-foreground truncate max-w-[200px]">{service.ctaText}</span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 pb-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input 
                        value={service.title} 
                        onChange={(e) => handleServiceChange(index, 'title', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>CTA Text</Label>
                      <Input 
                        value={service.ctaText} 
                        onChange={(e) => handleServiceChange(index, 'ctaText', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea 
                      value={service.description} 
                      onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Link</Label>
                    <Input 
                      value={service.link} 
                      onChange={(e) => handleServiceChange(index, 'link', e.target.value)}
                      placeholder="/services/example"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Image</Label>
                    {(() => {
                      const imageSrc = service.image ? resolveAssetSrc(service.image) : "";
                      const hasValidImage = imageSrc && imageSrc.trim() !== "" && (imageSrc.startsWith("http") || imageSrc.startsWith("https") || imageSrc.startsWith("data:"));
                      
                      return hasValidImage ? (
                        <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border bg-muted group">
                          <img
                            src={imageSrc}
                            alt={service.title}
                            className="w-full h-full object-cover"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleServiceChange(index, "image", "")}
                            disabled={uploadingId === service.id}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          {uploadingId === service.id && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            </div>
                          )}
                          <div
                            className={cn(
                              "absolute inset-0 flex flex-col items-center justify-center cursor-pointer transition-colors opacity-0 group-hover:opacity-100 bg-black/60",
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
                              if (file) uploadServiceImage(index, file);
                            }}
                            onClick={() => {
                              if (!uploadingId) {
                                const input = document.createElement("input");
                                input.type = "file";
                                input.accept = "image/jpeg,image/png,image/webp";
                                input.onchange = (e) => {
                                  const file = (e.target as HTMLInputElement).files?.[0];
                                  if (file) uploadServiceImage(index, file);
                                };
                                input.click();
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
                            "w-full h-48 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors",
                            draggingIndex === index
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50 hover:bg-muted/50",
                            uploadingId === service.id && "opacity-50 cursor-not-allowed"
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
                                if (file) uploadServiceImage(index, file);
                              };
                              input.click();
                            }
                          }}
                        >
                          {uploadingId === service.id ? (
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
                                or click to browse • Max 10MB
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                JPG, PNG, or WebP
                              </p>
                            </>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button variant="destructive" size="sm" onClick={() => removeService(index)}>
                      <Trash2 className="w-4 h-4 mr-2" /> Delete Service
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
