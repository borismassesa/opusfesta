"use client";

import { CareersNavbar } from "@/components/careers/CareersNavbar";
import { CareersFooter } from "@/components/careers/CareersFooter";
import Benefits from "@/components/careers/Benefits";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function BenefitsClient() {
  return (
    <div className="min-h-screen bg-background">
      <CareersNavbar />
      
      <main className="pt-24">
        <Benefits />
        
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pb-12">
          <div className="text-center">
            <Link href="/careers/positions">
              <Button size="lg" className="text-base px-8">
                View Open Positions
              </Button>
            </Link>
          </div>
        </div>
      </main>
      
      <CareersFooter />
    </div>
  );
}
