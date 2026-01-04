"use client"

import { useState } from "react";
import { useContent, FeaturedCompany } from "@/context/ContentContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Plus, Trash2, Upload, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { resolveAssetSrc } from "@/lib/assets";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";

export function AboutEditor() {
  const { content, updateContent } = useContent();
  const { about } = content;
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  const handleStatValueChange = (key: keyof typeof about.stats, value: string) => {
    updateContent("about", {
      stats: {
        ...about.stats,
        [key]: {
          ...about.stats[key],
          value
        }
      }
    });
  };

  const handleStatLabelChange = (key: keyof typeof about.stats, label: string) => {
    updateContent("about", {
      stats: {
        ...about.stats,
        [key]: {
          ...about.stats[key],
          label
        }
      }
    });
  };

  const handleHeadlineChange = (value: string) => {
    updateContent("about", { headline: value });
  };

  const handleFeaturedLabelChange = (value: string) => {
    updateContent("about", { featuredLabel: value });
  };

  const handleCompanyChange = (index: number, field: keyof FeaturedCompany, value: any) => {
    const updatedCompanies = [...about.featuredCompanies];
    updatedCompanies[index] = { ...updatedCompanies[index], [field]: value };
    console.log(`Updating company ${index} field ${field}:`, value);
    updateContent("about", { featuredCompanies: updatedCompanies });
    console.log("Content updated, new companies:", updatedCompanies.map(c => ({ name: c.name, logo: c.logo, logoType: c.logoType })));
  };

  const addCompany = () => {
    const newCompany: FeaturedCompany = {
      id: `company-${Date.now()}`,
      name: "New Company",
      logoType: "text",
      link: ""
    };
    updateContent("about", { featuredCompanies: [...about.featuredCompanies, newCompany] });
  };

  const removeCompany = (index: number) => {
    if (!confirm("Are you sure you want to delete this company?")) {
      return;
    }
    const updatedCompanies = about.featuredCompanies.filter((_, i) => i !== index);
    updateContent("about", { featuredCompanies: updatedCompanies });
  };

  const uploadCompanyLogo = async (index: number, file: File) => {
    // Prevent duplicate uploads
    if (uploadingIndex === index) {
      console.warn("Upload already in progress for index:", index);
      return;
    }
    
    console.log("uploadCompanyLogo called with:", { index, fileName: file.name, fileType: file.type, fileSize: file.size });
    const companyName = about.featuredCompanies[index]?.name || "Company";

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      console.error("Invalid file type:", file.type);
      toast.error(
        `Invalid file type. Please upload a JPG, PNG, WebP, or SVG image.`,
        5000
      );
      return;
    }

    // Validate file size (5MB max)
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      toast.error(
        `File too large. Please upload an image smaller than 5MB.`,
        5000
      );
      return;
    }

    const companyId = about.featuredCompanies[index]?.id ?? `company-${Date.now()}`;
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const filePath = `about/companies/${companyId}/logo-${fileName}`;

    setUploadingIndex(index);
    console.log("Starting upload to:", filePath);

    try {
      // Upload to Supabase Storage
      console.log("Uploading to Supabase...");
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from("cms")
        .upload(filePath, file, {
          contentType: file.type,
          upsert: true,
        });
      
      if (uploadError) {
        console.error("Upload error details:", {
          message: uploadError.message,
          statusCode: uploadError.statusCode,
          error: uploadError.error,
          name: uploadError.name
        });
        toast.error(
          `Failed to upload logo for ${companyName}: ${uploadError.message || "Unknown error occurred"}`,
          6000
        );
        setUploadingIndex(null);
        return;
      }
      
      console.log("Upload successful! Upload data:", uploadData);

      // Get public URL
      const { data: urlData } = supabase.storage.from("cms").getPublicUrl(filePath);
      console.log("Public URL data:", urlData);
      
      if (!urlData?.publicUrl) {
        console.error("Failed to get public URL. urlData:", urlData);
        toast.error(
          `Failed to get logo URL for ${companyName}. Please try again.`,
          5000
        );
        setUploadingIndex(null);
        return;
      }

      console.log("Updating company with logo URL:", urlData.publicUrl);
      
      // Update both logo and logoType in a single update to avoid race conditions
      const updatedCompanies = [...about.featuredCompanies];
      updatedCompanies[index] = { 
        ...updatedCompanies[index], 
        logo: urlData.publicUrl,
        logoType: "image" as const
      };
      updateContent("about", { featuredCompanies: updatedCompanies });
      
      console.log("Company updated successfully. New logo URL:", urlData.publicUrl);
      
      // Success!
      toast.success(
        `Logo uploaded successfully for ${companyName}!`,
        4000
      );
      
      setUploadingIndex(null);
    } catch (error) {
      console.error("Unexpected error during upload:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(
        `Failed to upload logo for ${companyName}: ${errorMessage}`,
        6000
      );
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
      uploadCompanyLogo(index, file);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card>
        <CardHeader>
          <CardTitle>About Headline</CardTitle>
          <CardDescription>Update the main headline text displayed in the About section.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Headline Text</Label>
            <Textarea 
              value={about.headline} 
              onChange={(e) => handleHeadlineChange(e.target.value)}
              placeholder="Enter the main headline text..."
              className="min-h-[120px]"
            />
            <p className="text-xs text-muted-foreground">
              This is the large headline text that appears at the top of the About section.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About Statistics</CardTitle>
          <CardDescription>Update the impact numbers and labels displayed in the About section.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Weddings Stat */}
            <div className="space-y-4 p-4 border border-border rounded-lg">
              <div className="space-y-2">
                <Label>Weddings Value</Label>
                <Input 
                  value={about.stats.weddings.value} 
                  onChange={(e) => handleStatValueChange("weddings", e.target.value)}
                  placeholder="15k+"
                />
                <p className="text-xs text-muted-foreground">The number/value to display (e.g., "15k+", "10,000+")</p>
              </div>
              <div className="space-y-2">
                <Label>Weddings Label</Label>
                <Input 
                  value={about.stats.weddings.label} 
                  onChange={(e) => handleStatLabelChange("weddings", e.target.value)}
                  placeholder="Planned Weddings"
                />
                <p className="text-xs text-muted-foreground">The label text below the number</p>
              </div>
            </div>
            
            {/* Satisfaction Stat */}
            <div className="space-y-4 p-4 border border-border rounded-lg">
              <div className="space-y-2">
                <Label>Satisfaction Value</Label>
                <Input 
                  value={about.stats.satisfaction.value} 
                  onChange={(e) => handleStatValueChange("satisfaction", e.target.value)}
                  placeholder="99%"
                />
                <p className="text-xs text-muted-foreground">The number/value to display (e.g., "99%", "98.5%")</p>
              </div>
              <div className="space-y-2">
                <Label>Satisfaction Label</Label>
                <Input 
                  value={about.stats.satisfaction.label} 
                  onChange={(e) => handleStatLabelChange("satisfaction", e.target.value)}
                  placeholder="User Satisfaction"
                />
                <p className="text-xs text-muted-foreground">The label text below the number</p>
              </div>
            </div>

            {/* Guests Stat */}
            <div className="space-y-4 p-4 border border-border rounded-lg">
              <div className="space-y-2">
                <Label>Guests Value</Label>
                <Input 
                  value={about.stats.guests.value} 
                  onChange={(e) => handleStatValueChange("guests", e.target.value)}
                  placeholder="2M+"
                />
                <p className="text-xs text-muted-foreground">The number/value to display (e.g., "2M+", "1.5M+")</p>
              </div>
              <div className="space-y-2">
                <Label>Guests Label</Label>
                <Input 
                  value={about.stats.guests.label} 
                  onChange={(e) => handleStatLabelChange("guests", e.target.value)}
                  placeholder="Happy Guests"
                />
                <p className="text-xs text-muted-foreground">The label text below the number</p>
              </div>
            </div>

            {/* Rating Stat */}
            <div className="space-y-4 p-4 border border-border rounded-lg">
              <div className="space-y-2">
                <Label>Rating Value</Label>
                <Input 
                  value={about.stats.rating.value} 
                  onChange={(e) => handleStatValueChange("rating", e.target.value)}
                  placeholder="4.9"
                />
                <p className="text-xs text-muted-foreground">The number/value to display (e.g., "4.9", "5.0")</p>
              </div>
              <div className="space-y-2">
                <Label>Rating Label</Label>
                <Input 
                  value={about.stats.rating.label} 
                  onChange={(e) => handleStatLabelChange("rating", e.target.value)}
                  placeholder="Average Rating"
                />
                <p className="text-xs text-muted-foreground">The label text below the number</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Featured Companies</CardTitle>
            <CardDescription>Manage the companies displayed in the "Featured in & Trusted By" section.</CardDescription>
          </div>
          <Button onClick={addCompany} size="sm">
            <Plus className="w-4 h-4 mr-2" /> Add Company
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 mb-6 pb-6 border-b border-border">
            <Label>Featured Section Label</Label>
            <Input 
              value={about.featuredLabel} 
              onChange={(e) => handleFeaturedLabelChange(e.target.value)}
              placeholder="Featured in & Trusted By"
            />
            <p className="text-xs text-muted-foreground">
              Label for the featured companies/trusted by section.
            </p>
          </div>
          <Accordion type="single" collapsible className="w-full space-y-4">
            {about.featuredCompanies.map((company, index) => (
              <AccordionItem key={company.id} value={`company-${company.id}`} className="border border-border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-4 text-left w-full">
                    {company.logoType === "image" && company.logo ? (
                      <div className="w-20 h-12 rounded-md overflow-hidden bg-muted/50 border border-border flex-shrink-0 flex items-center justify-center p-1.5">
                        <img
                          src={resolveAssetSrc(company.logo)}
                          alt={company.name}
                          className="w-full h-full object-contain max-w-full max-h-full"
                          onError={(e) => {
                            console.error("Failed to load company logo:", company.logo);
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-12 rounded-md bg-muted border border-border flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium text-muted-foreground truncate px-2">
                          {company.name.substring(0, 10)}
                        </span>
                      </div>
                    )}
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-medium">{company.name}</span>
                      <span className="text-xs text-muted-foreground truncate">
                        {company.logoType === "image" ? "Image Logo" : "Text Logo"}
                      </span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 pb-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Company Name</Label>
                      <Input 
                        value={company.name} 
                        onChange={(e) => handleCompanyChange(index, 'name', e.target.value)}
                        placeholder="Company name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Logo Type</Label>
                      <Select 
                        value={company.logoType} 
                        onValueChange={(value: "image" | "text") => handleCompanyChange(index, 'logoType', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="image">Image</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {company.logoType === "image" && (
                    <div className="space-y-2">
                      <Label>Company Logo</Label>
                      {company.logo ? (
                        <div className="relative w-full h-32 rounded-lg overflow-hidden border border-border bg-muted/50 group flex items-center justify-center p-4">
                          <img
                            src={resolveAssetSrc(company.logo)}
                            alt={company.name}
                            className="max-w-full max-h-full w-auto h-auto object-contain"
                            onError={(e) => {
                              console.error("Failed to load company logo:", company.logo);
                              toast.error(`Failed to load logo image for ${company.name}`, 5000);
                            }}
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleCompanyChange(index, "logo", undefined)}
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
                              if (file) uploadCompanyLogo(index, file);
                            }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (uploadingIndex === index) return;
                            
                            const input = document.createElement("input");
                            input.type = "file";
                            input.accept = "image/jpeg,image/png,image/webp,image/svg+xml";
                            input.style.display = "none";
                            
                            input.onchange = (event) => {
                              const target = event.target as HTMLInputElement;
                              const file = target.files?.[0];
                              if (file) {
                                console.log("File selected:", file.name, file.type, file.size);
                                uploadCompanyLogo(index, file);
                              }
                              // Clean up
                              if (document.body.contains(input)) {
                                document.body.removeChild(input);
                              }
                            };
                            
                            // Add to DOM temporarily (required for some browsers)
                            document.body.appendChild(input);
                            input.click();
                          }}
                          >
                            <Upload className="w-6 h-6 text-white mb-1" />
                            <p className="text-xs font-medium text-white">
                              Replace
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div
                          className={cn(
                            "w-full h-24 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors",
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
                            if (uploadingIndex === index) return;
                            
                            const input = document.createElement("input");
                            input.type = "file";
                            input.accept = "image/jpeg,image/png,image/webp,image/svg+xml";
                            input.style.display = "none";
                            
                            input.onchange = (event) => {
                              const target = event.target as HTMLInputElement;
                              const file = target.files?.[0];
                              if (file) {
                                console.log("File selected:", file.name, file.type, file.size);
                                uploadCompanyLogo(index, file);
                              }
                              // Clean up
                              if (document.body.contains(input)) {
                                document.body.removeChild(input);
                              }
                            };
                            
                            // Add to DOM temporarily (required for some browsers)
                            document.body.appendChild(input);
                            input.click();
                          }}
                        >
                          {uploadingIndex === index ? (
                            <>
                              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
                              <p className="text-xs text-muted-foreground">Uploading...</p>
                            </>
                          ) : (
                            <>
                              <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                              <p className="text-xs font-medium text-foreground mb-1">
                                Drag and drop logo here
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                or click to browse • Max 5MB
                              </p>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <Button variant="destructive" size="sm" onClick={() => removeCompany(index)}>
                      <Trash2 className="w-4 h-4 mr-2" /> Delete Company
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
