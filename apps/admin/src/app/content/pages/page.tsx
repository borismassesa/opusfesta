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

export default function PageEditor({ activeSection }: PageEditorProps) {
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
      <div className="flex items-center justify-between px-6 md:px-8 lg:px-12 xl:px-16 py-5 border-b border-border/60 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-5">
          <div>
            <h1 className="text-xl font-semibold text-foreground tracking-tight">Homepage Editor</h1>
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
                  {error && <span className="text-destructive font-medium">· {error}</span>}
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetContent}
            disabled={!canSave || isSaving || isLoading}
            className="h-9 px-3"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveDraft}
            disabled={!canSave || isSaving || isLoading}
            className="h-9 px-4"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
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
          
          {activeSection === "about" && (
            <div className="w-full max-w-7xl mx-auto px-6 md:px-8 lg:px-12 xl:px-16 py-10">
              <AboutEditor />
            </div>
          )}
          
          {activeSection === "services" && (
            <div className="w-full max-w-7xl mx-auto px-6 md:px-8 lg:px-12 xl:px-16 py-10">
              <ServicesEditor />
            </div>
          )}
          
          {activeSection === "community" && (
            <div className="w-full max-w-7xl mx-auto px-6 md:px-8 lg:px-12 xl:px-16 py-10">
              <CommunityEditor />
            </div>
          )}

          {activeSection === "advice" && (
            <div className="w-full max-w-7xl mx-auto px-6 md:px-8 lg:px-12 xl:px-16 py-10">
              <AdviceEditor />
            </div>
          )}

          {activeSection === "testimonials" && (
            <div className="w-full max-w-7xl mx-auto px-6 md:px-8 lg:px-12 xl:px-16 py-10">
              <TestimonialEditor />
            </div>
          )}

          {activeSection === "faq" && (
            <div className="w-full max-w-7xl mx-auto px-6 md:px-8 lg:px-12 xl:px-16 py-10">
              <FAQEditor />
            </div>
          )}

          {activeSection === "cta" && (
            <div className="w-full max-w-7xl mx-auto px-6 md:px-8 lg:px-12 xl:px-16 py-10">
              <CTAEditor />
            </div>
          )}

          {activeSection === "social" && (
            <div className="w-full max-w-7xl mx-auto px-6 md:px-8 lg:px-12 xl:px-16 py-10">
              <SocialEditor />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
