"use client"

import { useState } from "react";
import { useContent, IssueItem } from "@/context/ContentContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Plus, Trash2, Image as ImageIcon, Upload, X } from "lucide-react";
import { resolveAssetSrc } from "@/lib/assets";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";

export function IssuesEditor() {
  const { content, updateContent } = useContent();
  const { issues } = content;
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  const handleIssueChange = (index: number, field: keyof IssueItem, value: any) => {
    const newIssues = [...issues];
    newIssues[index] = { ...newIssues[index], [field]: value };
    updateContent("issues", newIssues);
  };

  const addIssue = () => {
    const newIssue: IssueItem = {
      id: Date.now(),
      title: "New Issue",
      desc: "Issue description",
      img: "",
    };
    updateContent("issues", [...issues, newIssue]);
  };

  const removeIssue = (index: number) => {
    const newIssues = issues.filter((_, i) => i !== index);
    updateContent("issues", newIssues);
  };

  const uploadIssueImage = async (index: number, file: File) => {
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

    const issueId = issues[index]?.id ?? Date.now();
    const ext = file.name.split(".").pop() ?? "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const filePath = `issues/${issueId}/${fileName}`;

    setUploadingId(issueId);

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
    handleIssueChange(index, "img", data.publicUrl);
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
      uploadIssueImage(index, file);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Editorial Issues</CardTitle>
            <CardDescription>Manage the issues/articles displayed on the homepage.</CardDescription>
          </div>
          <Button onClick={addIssue} size="sm">
            <Plus className="w-4 h-4 mr-2" /> Add Issue
          </Button>
        </CardHeader>
        <CardContent>
          {uploadError && (
            <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {uploadError}
            </div>
          )}
          <Accordion type="single" collapsible className="w-full space-y-4">
            {issues.map((issue, index) => (
              <AccordionItem key={issue.id} value={`issue-${issue.id}`} className="border border-border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-4 text-left w-full">
                    <div className="w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0 border border-border">
                      {issue.img ? (
                        <img
                          src={resolveAssetSrc(issue.img)}
                          alt={issue.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-medium">{issue.title}</span>
                      <span className="text-xs text-muted-foreground truncate">{issue.desc}</span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 pb-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input 
                        value={issue.title} 
                        onChange={(e) => handleIssueChange(index, 'title', e.target.value)}
                        placeholder="Issue title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Image</Label>
                      {issue.img && resolveAssetSrc(issue.img) ? (
                        <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border bg-muted group">
                          <img
                            src={resolveAssetSrc(issue.img)}
                            alt={issue.title}
                            className="w-full h-full object-cover"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleIssueChange(index, "img", "")}
                            disabled={uploadingId === issue.id}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          {uploadingId === issue.id && (
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
                              if (file) uploadIssueImage(index, file);
                            }}
                            onClick={() => {
                              if (!uploadingId) {
                                const input = document.createElement("input");
                                input.type = "file";
                                input.accept = "image/jpeg,image/png,image/webp";
                                input.onchange = (e) => {
                                  const file = (e.target as HTMLInputElement).files?.[0];
                                  if (file) uploadIssueImage(index, file);
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
                            uploadingId === issue.id && "opacity-50 cursor-not-allowed"
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
                                if (file) uploadIssueImage(index, file);
                              };
                              input.click();
                            }
                          }}
                        >
                          {uploadingId === issue.id ? (
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
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea 
                      value={issue.desc} 
                      onChange={(e) => handleIssueChange(index, 'desc', e.target.value)}
                      placeholder="Issue description"
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button variant="destructive" size="sm" onClick={() => removeIssue(index)}>
                      <Trash2 className="w-4 h-4 mr-2" /> Delete Issue
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
