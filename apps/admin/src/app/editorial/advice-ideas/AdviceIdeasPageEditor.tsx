"use client";

import { Button } from "@/components/ui/button";
import { Save, RotateCcw } from "lucide-react";
import { useAdviceIdeasContent } from "@/context/AdviceIdeasContentContext";
import { toast } from "@/lib/toast";
import { AdviceIdeasPageContentEditor } from "./AdviceIdeasPageContentEditor";
import type { AdviceIdeasSectionId } from "./AdviceIdeasPageContentEditor";

interface AdviceIdeasPageEditorProps {
  activeSection: AdviceIdeasSectionId;
  categories?: string[];
}

export function AdviceIdeasPageEditor({ activeSection, categories = [] }: AdviceIdeasPageEditorProps) {
  const {
    resetContent,
    saveDraft,
    publishContent,
    isLoading,
    isSaving,
    error,
    published,
    lastUpdatedAt,
  } = useAdviceIdeasContent();

  const handleSaveDraft = async () => {
    try {
      await saveDraft();
      toast.success("Draft saved.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save draft");
    }
  };

  const handlePublish = async () => {
    try {
      await publishContent();
      toast.success("Content published.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to publish content");
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {/* Same header as Homepage Editor */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-4 sm:py-5 border-b border-border/60 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-5 min-w-0 flex-1">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight truncate">
              Advice & Ideas Editor
            </h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs text-muted-foreground mt-1.5">
              {isLoading ? (
                <span className="text-muted-foreground">Loading...</span>
              ) : (
                <>
                  {lastUpdatedAt && (
                    <span className="text-muted-foreground whitespace-nowrap">
                      Last saved {new Date(lastUpdatedAt).toLocaleDateString()}
                    </span>
                  )}
                  {published ? (
                    <span className="px-2 py-0.5 rounded-md bg-green-500/10 text-green-700 dark:text-green-400 font-medium border border-green-500/20 whitespace-nowrap">
                      Published
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium border border-amber-500/20 whitespace-nowrap">
                      Draft
                    </span>
                  )}
                  {error && (
                    <span
                      className="text-destructive font-medium truncate"
                      title={error}
                    >
                      · {error.length > 30 ? `${error.substring(0, 30)}...` : error}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap sm:flex-nowrap">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetContent}
            disabled={isSaving || isLoading}
            className="h-9 px-2 sm:px-3 flex-shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="sr-only sm:not-sr-only sm:ml-0 ml-2">Reset</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveDraft}
            disabled={isSaving || isLoading}
            className="h-9 px-3 sm:px-4 flex-shrink-0"
          >
            <Save className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">{isSaving ? "Saving..." : "Save"}</span>
          </Button>
          <Button
            size="sm"
            onClick={handlePublish}
            disabled={isSaving || isLoading}
            className="h-9 px-3 sm:px-4 bg-foreground text-background hover:bg-foreground/90 flex-shrink-0"
          >
            <Save className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Publish</span>
          </Button>
        </div>
      </div>

      {/* Section content - same padding/layout as Homepage Editor */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="flex-1 min-h-0 overflow-y-auto bg-muted/20">
          <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 sm:py-8 md:py-10">
            <div className="max-w-[1600px] mx-auto">
              <AdviceIdeasPageContentEditor
                activeSection={activeSection}
                categories={categories}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
