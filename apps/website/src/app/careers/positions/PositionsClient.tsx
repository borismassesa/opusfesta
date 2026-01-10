"use client";

import { useState } from "react";
import { CareersNavbar } from "@/components/careers/CareersNavbar";
import { CareersFooter } from "@/components/careers/CareersFooter";
import { JobSection } from "@/components/careers/JobSection";

export function PositionsClient() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <CareersNavbar />
      
      <main>
        <JobSection />
      </main>
      
      <CareersFooter />
    </div>
  );
}
