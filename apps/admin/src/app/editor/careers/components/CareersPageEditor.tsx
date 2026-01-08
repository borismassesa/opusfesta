"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Save, RotateCcw, RefreshCw } from "lucide-react";
import { useCareersContent } from "@/context/CareersContentContext";
import { supabase } from "@/lib/supabaseClient";
import type { Session } from "@supabase/supabase-js";
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
  const [role, setRole] = useState("");

  const canSave = ["owner", "admin", "editor"].includes(role);
  const canPublish = ["owner", "admin"].includes(role);

  useEffect(() => {
    loadAdminContent();
  }, [loadAdminContent]);

  useEffect(() => {
    let mounted = true;
    const getRole = (session: Session | null) =>
      session?.user?.app_metadata?.role ?? "";

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setRole(getRole(data.session));
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setRole(getRole(session));
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

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
      <div className="flex items-center justify-between px-6 md:px-8 lg:px-12 xl:px-16 py-5 border-b border-border/60 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-5">
          <div>
            <h1 className="text-xl font-semibold text-foreground tracking-tight">Careers Editor</h1>
            <div className="flex items-center gap-2.5 text-xs text-muted-foreground mt-1.5">
              {isLoading ? (
                <span className="text-muted-foreground">Loading...</span>
              ) : (
                <>
                  {lastUpdatedAt && (
                    <span className="text-muted-foreground">Last saved {new Date(lastUpdatedAt).toLocaleDateString()}</span>
                  )}
                  {published ? (
                    <span className="px-2 py-0.5 rounded-md bg-green-500/10 text-green-700 dark:text-green-400 font-medium border border-green-500/20">
                      Published
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium border border-amber-500/20">
                      Draft
                    </span>
                  )}
                  {error && (
                    <span className="text-destructive font-medium" title={error}>
                      · Error: {error.length > 50 ? `${error.substring(0, 50)}...` : error}
                    </span>
                  )}
                  {!canSave && role && (
                    <span className="text-amber-600 dark:text-amber-400 text-xs">
                      · Insufficient permissions (Role: {role})
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSync}
            disabled={!canSave || isSaving || isLoading}
            className="h-9 px-3"
            title="Sync with current page content"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={!canSave || isSaving || isLoading}
            className="h-9 px-3"
            title="Reset to initial content (local only)"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveDraft}
            disabled={!canSave || isSaving || isLoading}
            className="h-9 px-4"
            title={!canSave ? `Save disabled. Your role: ${role || 'loading...'}` : 'Save draft'}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
          {!canSave && (
            <span className="text-xs text-muted-foreground">
              (Role: {role || 'loading...'})
            </span>
          )}
          {canPublish && (
            <Button 
              size="sm" 
              onClick={handlePublish} 
              disabled={isSaving || isLoading}
              className="h-9 px-4 bg-foreground text-background hover:bg-foreground/90"
            >
              <Save className="w-4 h-4 mr-2" />
              Publish
            </Button>
          )}
        </div>
      </div>

      {/* Section Content */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="flex-1 min-h-0 overflow-y-auto bg-muted/20">
          {activeSection === "hero" && (
            <div className="w-full max-w-7xl mx-auto px-6 md:px-8 lg:px-12 xl:px-16 py-10">
              <HeroEditor />
            </div>
          )}

          {activeSection === "values" && (
            <div className="w-full max-w-7xl mx-auto px-6 md:px-8 lg:px-12 xl:px-16 py-10">
              <ValuesEditor />
            </div>
          )}

          {activeSection === "perks" && (
            <div className="w-full max-w-7xl mx-auto px-6 md:px-8 lg:px-12 xl:px-16 py-10">
              <PerksEditor />
            </div>
          )}

          {activeSection === "testimonials" && (
            <div className="w-full max-w-7xl mx-auto px-6 md:px-8 lg:px-12 xl:px-16 py-10">
              <TestimonialsEditor />
            </div>
          )}

          {activeSection === "process" && (
            <div className="w-full max-w-7xl mx-auto px-6 md:px-8 lg:px-12 xl:px-16 py-10">
              <ProcessEditor />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
