"use client";

import { useState, useEffect } from "react";
import { X, Download, FileText, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";

interface FilePreviewProps {
  fileUrl: string;
  fileName: string;
  fileType?: "pdf" | "image" | "other";
  onDownload?: () => void;
  className?: string;
}

export function FilePreview({
  fileUrl,
  fileName,
  fileType,
  onDownload,
  className,
}: FilePreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const detectFileType = (url: string): "pdf" | "image" | "other" => {
    if (!fileType) {
      const extension = url.split(".").pop()?.toLowerCase();
      if (extension === "pdf") return "pdf";
      if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extension || "")) {
        return "image";
      }
    }
    return fileType || "other";
  };

  const handlePreview = async () => {
    setIsOpen(true);
    setIsLoading(true);
    
    try {
      // If it's already a full URL (signed URL), use it directly
      if (fileUrl.startsWith("http")) {
        setPreviewUrl(fileUrl);
        setIsLoading(false);
        return;
      }

      // For Supabase storage paths, create a signed URL
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert("Please log in to preview files");
        setIsOpen(false);
        setIsLoading(false);
        return;
      }

      // Extract the file path from the URL (remove bucket prefix if present)
      const filePath = fileUrl.replace(/^.*\/careers\//, "");
      
      const { data, error } = await supabase.storage
        .from("careers")
        .createSignedUrl(filePath, 3600);

      if (error || !data) {
        throw new Error("Failed to generate preview URL");
      }

      setPreviewUrl(data.signedUrl);
    } catch (error) {
      console.error("Error loading preview:", error);
      alert("Failed to load file preview");
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const detectedType = detectFileType(fileUrl);

  return (
    <>
      <div className={cn("flex items-center gap-2", className)}>
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreview}
          className="flex items-center gap-2"
        >
          {detectedType === "pdf" ? (
            <FileText className="w-4 h-4" />
          ) : detectedType === "image" ? (
            <ImageIcon className="w-4 h-4" />
          ) : (
            <FileText className="w-4 h-4" />
          )}
          Preview {fileName}
        </Button>
        {onDownload && (
          <Button variant="ghost" size="sm" onClick={onDownload}>
            <Download className="w-4 h-4" />
          </Button>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{fileName}</span>
              <div className="flex items-center gap-2">
                {onDownload && (
                  <Button variant="outline" size="sm" onClick={onDownload}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </DialogTitle>
            <DialogDescription>Preview of {fileName}</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto p-4 bg-muted/30">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                <p>Loading preview...</p>
              </div>
            ) : previewUrl ? (
              <>
                {detectedType === "pdf" ? (
                  <iframe
                    src={previewUrl}
                    className="w-full h-full min-h-[600px] border-0"
                    title={fileName}
                  />
                ) : detectedType === "image" ? (
                  <div className="flex items-center justify-center">
                    <img
                      src={previewUrl}
                      alt={fileName}
                      className="max-w-full max-h-[70vh] object-contain rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                    <FileText className="w-12 h-12 mb-4" />
                    <p>Preview not available for this file type</p>
                    {onDownload && (
                      <Button variant="outline" className="mt-4" onClick={onDownload}>
                        <Download className="w-4 h-4 mr-2" />
                        Download to view
                      </Button>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <FileText className="w-12 h-12 mb-4" />
                <p>Failed to load preview</p>
                {onDownload && (
                  <Button variant="outline" className="mt-4" onClick={onDownload}>
                    <Download className="w-4 h-4 mr-2" />
                    Download to view
                  </Button>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
