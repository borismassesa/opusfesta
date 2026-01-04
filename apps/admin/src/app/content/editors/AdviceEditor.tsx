"use client"

import { useState, useRef } from "react";
import { useContent, AdviceArticle } from "@/context/ContentContext";
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

export function AdviceEditor() {
  const { content, updateContent } = useContent();
  const { advice } = content;
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [openAccordion, setOpenAccordion] = useState<string | undefined>(undefined);

  const handleAdviceChange = (field: keyof typeof advice, value: any) => {
    updateContent("advice", { [field]: value });
  };

  const handleArticleChange = (index: number, field: keyof AdviceArticle, value: string) => {
    const updatedArticles = advice.articles.map((a, i) => 
      i === index ? { ...a, [field]: value } : a
    );
    updateContent("advice", { articles: updatedArticles });
  };

  const addArticle = () => {
    const newArticle: AdviceArticle = {
      id: `article-${Date.now()}`,
      title: "New Article",
      description: "Article description",
      image: "",
      link: ""
    };
    const updatedArticles = [...advice.articles, newArticle];
    updateContent("advice", { articles: updatedArticles });
    setTimeout(() => {
      setOpenAccordion(newArticle.id);
      const element = document.querySelector(`[value="${newArticle.id}"]`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }, 150);
  };

  const removeArticle = (index: number) => {
    if (!confirm("Are you sure you want to delete this article? This action cannot be undone.")) {
      return;
    }
    const articleToRemove = advice.articles[index];
    const newArticles = advice.articles.filter((_, i) => i !== index);
    updateContent("advice", { articles: newArticles });
    if (openAccordion === articleToRemove.id) {
      setOpenAccordion(undefined);
    }
  };

  const uploadArticleImage = async (index: number, file: File) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Image must be JPG, PNG, or WebP.", 4000);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be less than 10MB.", 4000);
      return;
    }

    const article = advice.articles[index];
    const articleName = article.title.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const fileExt = file.name.split(".").pop();
    const fileName = `image-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `advice/articles/${articleName}/${fileName}`;

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
        toast.error(`Failed to upload image: ${uploadError.message}`, 6000);
        setUploadingIndex(null);
        return;
      }

      const { data: urlData } = supabase.storage.from("cms").getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        toast.error("Failed to get image URL. Please try again.", 5000);
        setUploadingIndex(null);
        return;
      }

      const updatedArticles = [...advice.articles];
      updatedArticles[index] = {
        ...updatedArticles[index],
        image: urlData.publicUrl
      };
      updateContent("advice", { articles: updatedArticles });

      toast.success("Image uploaded successfully!", 4000);
      setUploadingIndex(null);
    } catch (error) {
      console.error("Unexpected error during upload:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to upload image: ${errorMessage}`, 6000);
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
      uploadArticleImage(index, file);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Advice Content */}
      <Card>
        <CardHeader>
          <CardTitle>Advice & Ideas Content</CardTitle>
          <CardDescription>Update the header content and call-to-action button for the Advice & Ideas section.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Section Label</Label>
            <Input
              value={advice.label}
              onChange={(e) => handleAdviceChange("label", e.target.value)}
              placeholder="Advice & Ideas"
            />
            <p className="text-xs text-muted-foreground">
              Small label text displayed above the headline.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Headline</Label>
            <Input
              value={advice.headline}
              onChange={(e) => handleAdviceChange("headline", e.target.value)}
              placeholder="Inspiration for"
            />
            <p className="text-xs text-muted-foreground">
              Main headline text (appears before the italic subheadline).
            </p>
          </div>

          <div className="space-y-2">
            <Label>Subheadline (Italic)</Label>
            <Input
              value={advice.subheadline}
              onChange={(e) => handleAdviceChange("subheadline", e.target.value)}
              placeholder="your big day."
            />
            <p className="text-xs text-muted-foreground">
              Subheadline text that appears in italic style.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={advice.description}
              onChange={(e) => handleAdviceChange("description", e.target.value)}
              placeholder="Expert guides, trending styles, and real wedding stories..."
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Description paragraph displayed in the header.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
            <div className="space-y-2">
              <Label>Button Text</Label>
              <Input
                value={advice.buttonText}
                onChange={(e) => handleAdviceChange("buttonText", e.target.value)}
                placeholder="Browse All Articles"
              />
            </div>
            <div className="space-y-2">
              <Label>Button Link</Label>
              <Input
                value={advice.buttonLink}
                onChange={(e) => handleAdviceChange("buttonLink", e.target.value)}
                placeholder="/services/advice"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Articles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Articles</CardTitle>
              <CardDescription>Manage the advice articles displayed in the Advice & Ideas section.</CardDescription>
            </div>
            <Button onClick={addArticle} size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Article
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {advice.articles.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="mb-4">No articles added yet.</p>
              <Button onClick={addArticle} variant="outline" size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Your First Article
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
              {advice.articles.map((article, index) => {
                const imageSrc = article.image ? resolveAssetSrc(article.image) : "";
                const hasValidImage = imageSrc && imageSrc.trim() !== "" && (imageSrc.startsWith("http") || imageSrc.startsWith("https") || imageSrc.startsWith("data:"));

                return (
                  <AccordionItem key={article.id} value={article.id} className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3 flex-1">
                        {hasValidImage ? (
                          <img
                            src={imageSrc}
                            alt={article.title}
                            className="w-16 h-16 rounded-md object-cover border border-border"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-md bg-muted border border-border flex items-center justify-center text-xs font-medium text-muted-foreground">
                            No Image
                          </div>
                        )}
                        <div className="text-left">
                          <div className="font-medium">{article.title}</div>
                          <div className="text-xs text-muted-foreground line-clamp-1">{article.description}</div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Title</Label>
                          <Input
                            value={article.title}
                            onChange={(e) => handleArticleChange(index, "title", e.target.value)}
                            placeholder="Article Title"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Link (Optional)</Label>
                          <Input
                            value={article.link || ""}
                            onChange={(e) => handleArticleChange(index, "link", e.target.value)}
                            placeholder="/advice/article-slug"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={article.description}
                          onChange={(e) => handleArticleChange(index, "description", e.target.value)}
                          placeholder="Article description..."
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Image</Label>
                        {hasValidImage ? (
                          <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border bg-muted group">
                            <img
                              src={imageSrc}
                              alt={article.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleArticleChange(index, "image", "")}
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
                                    if (file) uploadArticleImage(index, file);
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
                                  if (file) uploadArticleImage(index, file);
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
                                  or click to browse • Max 10MB • JPG, PNG, or WebP
                                </p>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end pt-2">
                        <Button variant="destructive" size="sm" onClick={() => removeArticle(index)}>
                          <Trash2 className="w-4 h-4 mr-2" /> Delete Article
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
