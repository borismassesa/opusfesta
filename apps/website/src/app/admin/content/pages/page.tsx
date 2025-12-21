"use client";

import { useEffect, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Eye, Save, RotateCcw, Monitor, Smartphone, Tablet } from "lucide-react";
import { useContent } from "@/context/ContentContext";
import { supabase } from "@/lib/supabaseClient";
import type { Session } from "@supabase/supabase-js";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { HeroEditor } from "../editors/HeroEditor";
import { ServicesEditor } from "../editors/ServicesEditor";
import { FAQEditor } from "../editors/FAQEditor";
import { AboutEditor } from "../editors/AboutEditor";
import { CommunityEditor } from "../editors/CommunityEditor";

export default function PageEditor() {
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
  const [activeView, setActiveView] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [role, setRole] = useState("");
  const [previewNonce, setPreviewNonce] = useState(0);
  const [previewZoom, setPreviewZoom] = useState(1);
  const [fitZoom, setFitZoom] = useState(1);
  const [autoFit, setAutoFit] = useState(true);
  const previewViewportRef = useRef<HTMLDivElement>(null);

  const DESKTOP_VIEW = { width: 1280, height: 720 };
  const TABLET_VIEW = { width: 768, height: 1024 };
  const MOBILE_VIEW = { width: 390, height: 844 };
  const ZOOM_MIN = 0.4;
  const ZOOM_MAX = 1.6;

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

  useEffect(() => {
    const container = previewViewportRef.current;
    if (!container) return;

    const getViewport = () => {
      if (activeView === "tablet") return TABLET_VIEW;
      if (activeView === "mobile") return MOBILE_VIEW;
      return DESKTOP_VIEW;
    };

    const updateFit = () => {
      const viewport = getViewport();
      const availableWidth = container.clientWidth;
      const availableHeight = container.clientHeight;
      if (!availableWidth || !availableHeight) return;
      const fit = Math.min(
        1,
        availableWidth / viewport.width,
        availableHeight / viewport.height,
      );
      const nextFit = Number(fit.toFixed(3));
      setFitZoom(nextFit);
      if (autoFit) {
        setPreviewZoom(nextFit);
      }
    };

    updateFit();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(updateFit);
      observer.observe(container);
      return () => observer.disconnect();
    }

    window.addEventListener("resize", updateFit);
    return () => window.removeEventListener("resize", updateFit);
  }, [activeView, autoFit]);

  useEffect(() => {
    setAutoFit(true);
  }, [activeView]);

  const handleZoomChange = (value: number) => {
    setAutoFit(false);
    setPreviewZoom(value);
  };

  const handleFit = () => {
    setAutoFit(true);
    setPreviewZoom(fitZoom);
  };

  const handleSaveDraft = async () => {
    if (!canSave) return;
    await saveDraft();
    setPreviewNonce((prev) => prev + 1);
  };

  const handlePublish = async () => {
    if (!canPublish) return;
    await publishContent();
    setPreviewNonce((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] gap-6 overflow-hidden">
      
      {/* Editor Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Homepage Editor</h1>
          <p className="text-muted-foreground">Manage content for the main landing page.</p>
          <div className="text-xs text-muted-foreground mt-2">
            {isLoading ? "Loading content..." : null}
            {!isLoading && lastUpdatedAt ? (
              <span>
                Last saved {new Date(lastUpdatedAt).toLocaleString()} ·{" "}
                {published ? "Published" : "Draft"}
              </span>
            ) : null}
            {!isLoading && lastPublishedAt ? (
              <span>
                {" "}
                · Last published {new Date(lastPublishedAt).toLocaleString()}
              </span>
            ) : null}
            {!canSave ? <span> · Read-only access</span> : null}
            {error ? <span className="text-destructive"> · {error}</span> : null}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={resetContent}
            title="Reset to Defaults"
            disabled={!canSave || isSaving || isLoading}
          >
            <RotateCcw className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Reset</span>
          </Button>
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={!canSave || isSaving || isLoading}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save Draft"}
          </Button>
          {canPublish ? (
            <Button onClick={handlePublish} disabled={isSaving || isLoading}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Publishing..." : "Publish Changes"}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <div className="lg:hidden h-full space-y-6 overflow-y-auto pr-2 pb-20">
          <Tabs defaultValue="hero" className="w-full">
          <TabsList className="w-full justify-start mb-6 overflow-x-auto">
            <TabsTrigger value="hero">Hero Section</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="about">About Us</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>
          
          <TabsContent value="hero">
            <HeroEditor />
          </TabsContent>
          
          <TabsContent value="services">
            <ServicesEditor />
          </TabsContent>
          
          <TabsContent value="about">
            <AboutEditor />
          </TabsContent>
          
           <TabsContent value="community">
            <CommunityEditor />
          </TabsContent>

          <TabsContent value="faq">
            <FAQEditor />
          </TabsContent>
          </Tabs>
        </div>

        <ResizablePanelGroup
          direction="horizontal"
          className="hidden lg:flex h-full w-full overflow-hidden"
        >
        <ResizablePanel defaultSize={62} minSize={35} className="min-w-0 min-h-0">
          <div className="h-full min-h-0 space-y-6 overflow-y-auto overscroll-contain no-scrollbar pr-4 pb-20">
            <Tabs defaultValue="hero" className="w-full">
              <TabsList className="w-full justify-start mb-6 overflow-x-auto">
                <TabsTrigger value="hero">Hero Section</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
                <TabsTrigger value="about">About Us</TabsTrigger>
                <TabsTrigger value="community">Community</TabsTrigger>
                <TabsTrigger value="faq">FAQ</TabsTrigger>
              </TabsList>
              
              <TabsContent value="hero">
                <HeroEditor />
              </TabsContent>
              
              <TabsContent value="services">
                <ServicesEditor />
              </TabsContent>
              
              <TabsContent value="about">
                <AboutEditor />
              </TabsContent>
              
               <TabsContent value="community">
                <CommunityEditor />
              </TabsContent>

              <TabsContent value="faq">
                <FAQEditor />
              </TabsContent>
            </Tabs>
          </div>
        </ResizablePanel>

        <ResizableHandle
          withHandle
          className="w-2 bg-transparent hover:bg-transparent transition-colors"
        />

        <ResizablePanel defaultSize={38} minSize={25} className="min-w-0 min-h-0">
          <div className="flex h-full min-h-0 flex-col gap-4 overflow-hidden pl-4 pr-2 pb-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Eye className="w-4 h-4" /> Live Preview
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleZoomChange(Math.max(ZOOM_MIN, Number((previewZoom - 0.1).toFixed(2))))}
                  className="h-9 w-9 rounded-md border border-border bg-surface text-sm font-semibold text-primary hover:bg-muted"
                  aria-label="Zoom out"
                >
                  -
                </button>
                <button
                  onClick={handleFit}
                  className="h-9 rounded-md border border-border bg-surface px-3 text-xs font-medium text-muted-foreground hover:text-primary"
                >
                  Fit
                </button>
                <button
                  onClick={() => handleZoomChange(Math.min(ZOOM_MAX, Number((previewZoom + 0.1).toFixed(2))))}
                  className="h-9 w-9 rounded-md border border-border bg-surface text-sm font-semibold text-primary hover:bg-muted"
                  aria-label="Zoom in"
                >
                  +
                </button>
                <div className="hidden xl:flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1 text-xs text-muted-foreground">
                  {Math.round(previewZoom * 100)}%
                </div>
                <div className="flex bg-surface border border-border rounded-md p-1">
                  <button 
                    onClick={() => setActiveView("desktop")}
                    className={`p-1.5 rounded-sm transition-colors ${activeView === "desktop" ? "bg-primary text-background" : "hover:bg-muted"}`}
                  >
                    <Monitor className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setActiveView("tablet")}
                    className={`p-1.5 rounded-sm transition-colors ${activeView === "tablet" ? "bg-primary text-background" : "hover:bg-muted"}`}
                  >
                    <Tablet className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setActiveView("mobile")}
                    className={`p-1.5 rounded-sm transition-colors ${activeView === "mobile" ? "bg-primary text-background" : "hover:bg-muted"}`}
                  >
                    <Smartphone className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            <div
              ref={previewViewportRef}
              className="flex-1 min-h-0 overflow-hidden no-scrollbar flex items-center justify-center pt-4"
            >
              <div
                className="flex-shrink-0"
                style={{
                  width:
                    (activeView === "desktop"
                      ? DESKTOP_VIEW.width
                      : activeView === "tablet"
                      ? TABLET_VIEW.width
                      : MOBILE_VIEW.width) * previewZoom,
                  height:
                    (activeView === "desktop"
                      ? DESKTOP_VIEW.height
                      : activeView === "tablet"
                      ? TABLET_VIEW.height
                      : MOBILE_VIEW.height) * previewZoom,
                }}
              >
                <div
                  className="border-[8px] border-zinc-800 rounded-[2rem] overflow-hidden bg-background shadow-2xl transition-all duration-300"
                  style={{
                    width:
                      activeView === "desktop"
                        ? DESKTOP_VIEW.width
                        : activeView === "tablet"
                        ? TABLET_VIEW.width
                        : MOBILE_VIEW.width,
                    height:
                      activeView === "desktop"
                        ? DESKTOP_VIEW.height
                        : activeView === "tablet"
                        ? TABLET_VIEW.height
                        : MOBILE_VIEW.height,
                    transform: `scale(${previewZoom})`,
                    transformOrigin: "top left",
                  }}
                >
                  <iframe
                    key={`${previewNonce}-${activeView}`}
                    src={`/?preview=draft&v=${previewNonce}`}
                    className="w-full h-full bg-white"
                    title="Preview"
                  />
                </div>
              </div>
            </div>
          </div>
        </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
