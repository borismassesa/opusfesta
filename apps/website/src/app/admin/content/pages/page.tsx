"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Eye, Save, RotateCcw, Monitor, Smartphone, Tablet } from "lucide-react";
import { useContent } from "@/context/ContentContext";
import { HeroEditor } from "../editors/HeroEditor";
import { ServicesEditor } from "../editors/ServicesEditor";
import { FAQEditor } from "../editors/FAQEditor";
import { AboutEditor } from "../editors/AboutEditor";
import { CommunityEditor } from "../editors/CommunityEditor";

export default function PageEditor() {
  const { resetContent } = useContent();
  const [activeView, setActiveView] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] md:h-auto gap-6">
      
      {/* Editor Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Homepage Editor</h1>
          <p className="text-muted-foreground">Manage content for the main landing page.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={resetContent} title="Reset to Defaults">
            <RotateCcw className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Reset</span>
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Publish Changes"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
        {/* Left Column: Editors */}
        <div className="lg:col-span-2 space-y-6 overflow-y-auto pr-2 pb-20">
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

        {/* Right Column: Preview (Sticky) */}
        <div className="hidden lg:flex flex-col gap-4 sticky top-6 h-fit">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-semibold flex items-center gap-2">
              <Eye className="w-4 h-4" /> Live Preview
            </h3>
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
          
          <div className="border-[8px] border-zinc-800 rounded-[2rem] overflow-hidden bg-background shadow-2xl transition-all duration-300 mx-auto"
               style={{
                 width: activeView === "desktop" ? "100%" : activeView === "tablet" ? "768px" : "375px",
                 height: "600px"
               }}
          >
            <iframe 
              src="/" 
              className="w-full h-full bg-white" 
              title="Preview"
              style={{ transform: activeView === "desktop" ? "scale(0.8) translateY(-10%)" : "none", transformOrigin: "top center", height: activeView === "desktop" ? "125%" : "100%" }} 
            />
          </div>
          <p className="text-xs text-center text-muted-foreground mt-2">
            *Preview might not reflect animations accurately in iframe mode.
          </p>
        </div>
      </div>
    </div>
  );
}
