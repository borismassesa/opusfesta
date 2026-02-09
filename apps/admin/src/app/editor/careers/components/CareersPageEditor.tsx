"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Save, RotateCcw, RefreshCw } from "lucide-react";
import { useCareersContent } from "@/context/CareersContentContext";
import { useAuth } from "@clerk/nextjs";
import { HeroEditor } from "../editors/HeroEditor";
import { TestimonialsEditor } from "../editors/TestimonialsEditor";
import { ValuesEditor } from "../editors/ValuesEditor";
import { PerksEditor } from "../editors/PerksEditor";
import { ProcessEditor } from "../editors/ProcessEditor";

type SectionId = "hero" | "values" | "perks" | "testimonials" | "process";

interface CareersPageEditorProps {
  activeSection: SectionId;
}

export function CareersPageEditor({ activeSection }: CareersPageEditorProps) {
  const {
    resetContent,
    syncWithInitialContent,
    loadAdminContent,
    saveDraft,
    publishContent,
    isLoading,
    isSaving,
    error,
    published,
    lastUpdatedAt,
    lastPublishedAt,
  } = useCareersContent();
  const { getToken, sessionClaims } = useAuth();
  const [role, setRole] = useState("");

  const canSave = ["owner", "admin", "editor"].includes(role);
  const canPublish = ["owner", "admin"].includes(role);

  useEffect(() => {
    loadAdminContent();
  }, [loadAdminContent]);

  useEffect(() => {
    const claimsRole = (sessionClaims as any)?.metadata?.role ?? "";
    setRole(claimsRole);
  }, [sessionClaims]);

  const handleSaveDraft = async () => {
    if (!canSave) {
      console.warn('[CareersEditor] Save blocked: insufficient permissions. Role:', role);
      const { toast } = await import('@/lib/toast');
      toast.error(`Cannot save: Insufficient permissions. Your role: ${role || 'loading...'}`);
      return;
    }
    try {
      await saveDraft();
    } catch (error) {
      console.error('[CareersEditor] Error in handleSaveDraft:', error);
      const { toast } = await import('@/lib/toast');
      toast.error(`Failed to save: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handlePublish = async () => {
    if (!canPublish) {
      const { toast } = await import('@/lib/toast');
      toast.error(`Cannot publish: Insufficient permissions. Your role: ${role || 'loading...'}`);
      return;
    }
    try {
      await publishContent();
    } catch (error) {
      console.error('[CareersEditor] Error in handlePublish:', error);
      const { toast } = await import('@/lib/toast');
      toast.error(`Failed to publish: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleSync = async () => {
    if (!canSave) {
      const { toast } = await import('@/lib/toast');
      toast.error(`Cannot sync: Insufficient permissions. Your role: ${role || 'loading...'}`);
      return;
    }
    try {
      await syncWithInitialContent();
    } catch (error) {
      console.error('[CareersEditor] Error in handleSync:', error);
      const { toast } = await import('@/lib/toast');
      toast.error(`Failed to sync: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleReset = async () => {
    if (!canSave) {
      const { toast } = await import('@/lib/toast');
      toast.error(`Cannot reset: Insufficient permissions. Your role: ${role || 'loading...'}`);
      return;
    }
    resetContent();
    const { toast } = await import('@/lib/toast');
    toast.info('Content reset to initial values (local only - click Save to persist)');
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-4 sm:py-5 border-b border-border/60 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-5 min-w-0 flex-1">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight truncate">Careers Editor</h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs text-muted-foreground mt-1.5">
              {isLoading ? (
                <span className="text-muted-foreground">Loading...</span>
              ) : (
                <>
                  {lastUpdatedAt && (
                    <span className="text-muted-foreground whitespace-nowrap">Last saved {new Date(lastUpdatedAt).toLocaleDateString()}</span>
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
                    <span className="text-destructive font-medium truncate" title={error}>
                      · Error: {error.length > 30 ? `${error.substring(0, 30)}...` : error}
                    </span>
                  )}
                  {!canSave && role && (
                    <span className="text-amber-600 dark:text-amber-400 text-xs whitespace-nowrap hidden sm:inline">
                      · Insufficient permissions (Role: {role})
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
            onClick={handleSync}
            disabled={!canSave || isSaving || isLoading}
            className="h-9 px-2 sm:px-3 flex-shrink-0"
            title="Sync with current page content"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="sr-only sm:not-sr-only sm:ml-0 ml-2">Sync</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={!canSave || isSaving || isLoading}
            className="h-9 px-2 sm:px-3 flex-shrink-0"
            title="Reset to initial content (local only)"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="sr-only sm:not-sr-only sm:ml-0 ml-2">Reset</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveDraft}
            disabled={!canSave || isSaving || isLoading}
            className="h-9 px-3 sm:px-4 flex-shrink-0"
            title={!canSave ? `Save disabled. Your role: ${role || 'loading...'}` : 'Save draft'}
          >
            <Save className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">{isSaving ? "Saving..." : "Save"}</span>
          </Button>
          {!canSave && (
            <span className="text-xs text-muted-foreground whitespace-nowrap hidden lg:inline">
              (Role: {role || 'loading...'})
            </span>
          )}
          {canPublish && (
            <Button 
              size="sm" 
              onClick={handlePublish} 
              disabled={isSaving || isLoading}
              className="h-9 px-3 sm:px-4 bg-foreground text-background hover:bg-foreground/90 flex-shrink-0"
            >
              <Save className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Publish</span>
            </Button>
          )}
        </div>
      </div>

      {/* Section Content */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="flex-1 min-h-0 overflow-y-auto bg-muted/20">
          {activeSection === "hero" && (
            <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 sm:py-8 md:py-10">
              <div className="max-w-[1600px] mx-auto">
                <HeroEditor />
              </div>
            </div>
          )}

          {activeSection === "values" && (
            <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 sm:py-8 md:py-10">
              <div className="max-w-[1600px] mx-auto">
                <ValuesEditor />
              </div>
            </div>
          )}

          {activeSection === "perks" && (
            <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 sm:py-8 md:py-10">
              <div className="max-w-[1600px] mx-auto">
                <PerksEditor />
              </div>
            </div>
          )}

          {activeSection === "testimonials" && (
            <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 sm:py-8 md:py-10">
              <div className="max-w-[1600px] mx-auto">
                <TestimonialsEditor />
              </div>
            </div>
          )}

          {activeSection === "process" && (
            <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 sm:py-8 md:py-10">
              <div className="max-w-[1600px] mx-auto">
                <ProcessEditor />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
