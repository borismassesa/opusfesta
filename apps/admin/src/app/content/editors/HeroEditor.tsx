"use client"

import { useState } from "react";
import { useContent } from "@/context/ContentContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Film, Image as ImageIcon, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export function HeroEditor() {
  const { content, updateContent } = useContent();
  const { hero } = content;
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [videoNames, setVideoNames] = useState<Record<number, string>>({});
  const [posterNames, setPosterNames] = useState<Record<number, string>>({});

  const MAX_VIDEO_SECONDS = 30;
  const MAX_VIDEO_MB = 50;
  const MAX_WIDTH = 1920;
  const MAX_HEIGHT = 1080;

  const handleTextChange = (field: keyof typeof hero, value: any) => {
    updateContent("hero", { [field]: value });
  };

  const updateTypingPhrase = (index: number, value: string) => {
    const newPhrases = [...hero.typingPhrases];
    newPhrases[index] = value;
    updateContent("hero", { typingPhrases: newPhrases });
  };

  const addTypingPhrase = () => {
    updateContent("hero", { typingPhrases: [...hero.typingPhrases, "New phrase"] });
  };

  const removeTypingPhrase = (index: number) => {
    const newPhrases = hero.typingPhrases.filter((_, i) => i !== index);
    updateContent("hero", { typingPhrases: newPhrases });
  };

  const updateSlide = (index: number, data: Partial<(typeof hero.slides)[number]>) => {
    const nextSlides = hero.slides.map((slide, idx) =>
      idx === index ? { ...slide, ...data } : slide
    );
    updateContent("hero", { slides: nextSlides });
  };

  const addSlide = () => {
    const nextSlides = [
      ...hero.slides,
      {
        id: Date.now(),
        video: "",
        poster: "",
        author: "New Creator",
        avatar: "",
        color: "var(--surface)",
      },
    ];
    updateContent("hero", { slides: nextSlides });
  };

  const removeSlide = (index: number) => {
    const nextSlides = hero.slides.filter((_, idx) => idx !== index);
    updateContent("hero", { slides: nextSlides });
  };

  const readVideoMetadata = (file: File) =>
    new Promise<{ duration: number; width: number; height: number }>((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      const objectUrl = URL.createObjectURL(file);
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(objectUrl);
        resolve({
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight,
        });
      };
      video.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Unable to read video metadata."));
      };
      video.src = objectUrl;
    });

  const uploadHeroVideo = async (index: number, file: File) => {
    setUploadError(null);

    if (file.type !== "video/mp4") {
      setUploadError("Video must be MP4 (H.264 + AAC).");
      return;
    }

    const maxBytes = MAX_VIDEO_MB * 1024 * 1024;
    if (file.size > maxBytes) {
      setUploadError(`Video must be <= ${MAX_VIDEO_MB}MB.`);
      return;
    }

    let metadata;
    try {
      metadata = await readVideoMetadata(file);
    } catch (error) {
      setUploadError((error as Error).message);
      return;
    }

    if (metadata.duration > MAX_VIDEO_SECONDS) {
      setUploadError(`Video must be <= ${MAX_VIDEO_SECONDS} seconds.`);
      return;
    }

    if (metadata.width > MAX_WIDTH || metadata.height > MAX_HEIGHT) {
      setUploadError(`Video must be <= ${MAX_WIDTH}x${MAX_HEIGHT}.`);
      return;
    }

    const slideId = hero.slides[index]?.id ?? Date.now();
    const ext = file.name.split(".").pop() ?? "mp4";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const filePath = `hero/${slideId}/${fileName}`;

    setUploadingId(slideId);

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
    updateSlide(index, { video: data.publicUrl });
    setUploadingId(null);
  };

  const uploadPoster = async (index: number, file: File) => {
    setUploadError(null);

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setUploadError("Poster must be PNG or JPG.");
      return;
    }

    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      setUploadError("Poster must be <= 5MB.");
      return;
    }

    const slideId = hero.slides[index]?.id ?? Date.now();
    const ext = file.name.split(".").pop() ?? "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const filePath = `hero/${slideId}/poster-${fileName}`;

    setUploadingId(slideId);

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
    updateSlide(index, { poster: data.publicUrl });
    setUploadingId(null);
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/60 shadow-sm bg-card">
        <CardHeader className="pb-4 px-6 pt-6">
          <CardTitle className="text-base font-semibold">Hero Text</CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-1">
            Customize the main headline and introduction
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 px-6 pb-6">
          <div className="space-y-2">
            <Label htmlFor="headlinePrefix" className="text-sm font-medium text-foreground">
              Headline Prefix
            </Label>
            <Input 
              id="headlinePrefix" 
              value={hero.headlinePrefix} 
              onChange={(e) => handleTextChange("headlinePrefix", e.target.value)}
              className="h-10 border-border/60"
              placeholder="Plan the Wedding,"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground">Typing Phrases</Label>
            <div className="space-y-2.5">
              {hero.typingPhrases.map((phrase, index) => (
                <div key={index} className="flex gap-2">
                  <Input 
                    value={phrase} 
                    onChange={(e) => updateTypingPhrase(index, e.target.value)}
                    className="h-10 border-border/60"
                    placeholder="Enter phrase..."
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeTypingPhrase(index)}
                    className="h-10 w-10 shrink-0 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={addTypingPhrase} 
                className="w-full h-9 border-border/60"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Phrase
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subhead" className="text-sm font-medium text-foreground">
              Subhead
            </Label>
            <Textarea 
              id="subhead" 
              value={hero.subhead} 
              onChange={(e) => handleTextChange("subhead", e.target.value)}
              className="min-h-[100px] resize-none border-border/60"
              placeholder="Enter subhead text..."
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-sm bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-4 px-6 pt-6">
          <div>
            <CardTitle className="text-base font-semibold">Hero Video Slides</CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1">
              Upload MP4 videos (max 30s, H.264 + AAC, up to 1920x1080, 50MB)
            </CardDescription>
          </div>
          <Button onClick={addSlide} size="sm" className="h-9 px-4">
            <Plus className="w-4 h-4 mr-2" /> Add Slide
          </Button>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          {uploadError ? (
            <p className="text-sm text-destructive mb-4">{uploadError}</p>
          ) : null}
          <Accordion type="single" collapsible className="w-full space-y-3">
            {hero.slides.map((slide, index) => (
              <AccordionItem key={slide.id} value={`slide-${slide.id}`} className="border border-border/60 rounded-lg px-5 bg-background shadow-sm">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-left w-full">
                    <div className="w-16 h-10 rounded-md overflow-hidden bg-muted/50 flex-shrink-0 border border-border/60">
                      {slide.poster || slide.video ? (
                        <video
                          src={slide.video}
                          poster={slide.poster || undefined}
                          className="w-full h-full object-cover"
                          muted
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Film className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-medium text-sm">{slide.author || "Untitled Slide"}</span>
                      <span className="text-xs text-muted-foreground truncate">
                        {slide.video ? "Video uploaded" : "No video yet"}
                      </span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-5 pb-6 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">Creator Name</Label>
                      <Input
                        value={slide.author}
                        onChange={(e) => updateSlide(index, { author: e.target.value })}
                        className="h-10 border-border/60"
                        placeholder="Creator name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">Creator Avatar URL</Label>
                      <Input
                        value={slide.avatar}
                        onChange={(e) => updateSlide(index, { avatar: e.target.value })}
                        className="h-10 border-border/60"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">Background Color</Label>
                    <Input
                      value={slide.color}
                      onChange={(e) => updateSlide(index, { color: e.target.value })}
                      className="h-10 border-border/60"
                      placeholder="var(--surface)"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">Upload MP4 Video</Label>
                    <div className="flex flex-col gap-2.5">
                      <label
                        htmlFor={`hero-video-${slide.id}`}
                        className="flex items-center justify-between gap-4 rounded-lg border border-dashed border-border/60 bg-muted/30 px-4 py-3.5 text-sm text-muted-foreground hover:border-primary/50 hover:bg-muted/40 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-background border border-border">
                            <Film className="h-4 w-4 text-primary" />
                          </span>
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">Choose MP4 video</span>
                            <span className="text-xs">
                              {videoNames[slide.id] || "No file selected"}
                            </span>
                          </div>
                        </div>
                        <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-primary">
                          Upload
                        </span>
                      </label>
                      <input
                        id={`hero-video-${slide.id}`}
                        type="file"
                        accept="video/mp4"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setVideoNames((prev) => ({ ...prev, [slide.id]: file.name }));
                            uploadHeroVideo(index, file);
                          }
                        }}
                      />
                      <div className="text-xs text-muted-foreground">
                        Max {MAX_VIDEO_SECONDS}s · {MAX_VIDEO_MB}MB · {MAX_WIDTH}x{MAX_HEIGHT}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {slide.video ? "Video uploaded to CMS storage." : "No video uploaded yet."}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">Poster Image (optional)</Label>
                    <div className="flex flex-col gap-2.5">
                      <label
                        htmlFor={`hero-poster-${slide.id}`}
                        className="flex items-center justify-between gap-4 rounded-lg border border-dashed border-border/60 bg-muted/30 px-4 py-3.5 text-sm text-muted-foreground hover:border-primary/50 hover:bg-muted/40 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-background border border-border">
                            <ImageIcon className="h-4 w-4 text-primary" />
                          </span>
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">Choose poster image</span>
                            <span className="text-xs">
                              {posterNames[slide.id] || "No file selected"}
                            </span>
                          </div>
                        </div>
                        <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-primary">
                          Upload
                        </span>
                      </label>
                      <input
                        id={`hero-poster-${slide.id}`}
                        type="file"
                        accept="image/png,image/jpeg"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setPosterNames((prev) => ({ ...prev, [slide.id]: file.name }));
                            uploadPoster(index, file);
                          }
                        }}
                      />
                      {slide.poster ? (
                        <Input
                          value={slide.poster}
                          readOnly
                          className="bg-muted text-muted-foreground"
                        />
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border/60">
                    <div className="text-xs text-muted-foreground">
                      {uploadingId === slide.id ? (
                        <span className="flex items-center gap-2">
                          <span className="animate-spin">⏳</span> Uploading...
                        </span>
                      ) : (
                        "Ready"
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateSlide(index, { video: "", poster: "" })}
                        disabled={!slide.video && !slide.poster}
                        className="h-8 px-3 border-border/60"
                      >
                        Clear
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => removeSlide(index)}
                        className="h-8 px-3"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Remove
                      </Button>
                    </div>
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
