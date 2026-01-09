"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Save, RotateCcw } from "lucide-react";
import { useContent } from "@/context/ContentContext";
import { supabase } from "@/lib/supabaseClient";
import type { Session } from "@supabase/supabase-js";
import { HeroEditor } from "../editors/HeroEditor";
import { ServicesEditor } from "../editors/ServicesEditor";
import { FAQEditor } from "../editors/FAQEditor";
import { AboutEditor } from "../editors/AboutEditor";
import { CommunityEditor } from "../editors/CommunityEditor";
import { CTAEditor } from "../editors/CTAEditor";
import { AdviceEditor } from "../editors/AdviceEditor";
import { TestimonialEditor } from "../editors/TestimonialEditor";
import { SocialEditor } from "../editors/SocialEditor";

type SectionId = "hero" | "about" | "services" | "community" | "advice" | "testimonials" | "faq" | "cta" | "social";

interface PageEditorProps {
  activeSection: SectionId;
}

export function PageEditor({ activeSection }: PageEditorProps) {
  const {
    resetContent,
    loadAdminContent,
    saveDraft,
    publishContent,
    isLoading,
    isSaving,
    error,
    published,
    lastUpdatedAt,
    lastPublishedAt,
  } = useContent();
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
    if (!canSave) return;
    await saveDraft();
  };

  const handlePublish = async () => {
    if (!canPublish) return;
    await publishContent();
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {/* Refined Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-4 sm:py-5 border-b border-border/60 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-5 min-w-0 flex-1">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight truncate">Homepage Editor</h1>
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
                  {error && <span className="text-destructive font-medium truncate" title={error}>· {error.length > 30 ? `${error.substring(0, 30)}...` : error}</span>}
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
            disabled={!canSave || isSaving || isLoading}
            className="h-9 px-2 sm:px-3 flex-shrink-0"
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
          >
            <Save className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">{isSaving ? "Saving..." : "Save"}</span>
          </Button>
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
          
          {activeSection === "about" && (
            <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 sm:py-8 md:py-10">
              <div className="max-w-[1600px] mx-auto">
                <AboutEditor />
              </div>
            </div>
          )}
          
          {activeSection === "services" && (
            <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 sm:py-8 md:py-10">
              <div className="max-w-[1600px] mx-auto">
                <ServicesEditor />
              </div>
            </div>
          )}
          
          {activeSection === "community" && (
            <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 sm:py-8 md:py-10">
              <div className="max-w-[1600px] mx-auto">
                <CommunityEditor />
              </div>
            </div>
          )}

          {activeSection === "advice" && (
            <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 sm:py-8 md:py-10">
              <div className="max-w-[1600px] mx-auto">
                <AdviceEditor />
              </div>
            </div>
          )}

          {activeSection === "testimonials" && (
            <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 sm:py-8 md:py-10">
              <div className="max-w-[1600px] mx-auto">
                <TestimonialEditor />
              </div>
            </div>
          )}

          {activeSection === "faq" && (
            <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 sm:py-8 md:py-10">
              <div className="max-w-[1600px] mx-auto">
                <FAQEditor />
              </div>
            </div>
          )}

          {activeSection === "cta" && (
            <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 sm:py-8 md:py-10">
              <div className="max-w-[1600px] mx-auto">
                <CTAEditor />
              </div>
            </div>
          )}

          {activeSection === "social" && (
            <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 sm:py-8 md:py-10">
              <div className="max-w-[1600px] mx-auto">
                <SocialEditor />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
