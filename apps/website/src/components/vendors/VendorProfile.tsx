"use client";

import { MessageCircle } from "lucide-react";
import Image from "next/image";
import type { Vendor, Review } from "@/lib/supabase/vendors";

interface VendorProfileProps {
  vendor: Vendor;
  reviews: Review[];
}

export function VendorProfile({ vendor, reviews }: VendorProfileProps) {
  // For now, we'll show the vendor owner as the main team member
  // In the future, this can be expanded to show multiple team members from a team_members table
  
  const teamSize = vendor.team_size || 1;
  const teamSizeLabel = teamSize <= 2 
    ? 'Small team' 
    : teamSize <= 10 
    ? 'Small team'
    : teamSize <= 50
    ? 'Medium team'
    : 'Large team';

  return (
    <div id="section-team" className="pt-12 border-t border-border scroll-mt-32 lg:scroll-mt-40">
      <h2 className="text-2xl md:text-3xl font-semibold mb-8">Team</h2>

       {/* Team Size Info */}
       {teamSize > 1 && (
         <div className="mb-6">
           <p className="text-base text-secondary">
             {teamSizeLabel} {teamSize} {teamSize === 1 ? 'member' : 'members'}
           </p>
         </div>
       )}

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Main Contact / Owner Card */}
        <div className="bg-background border border-border rounded-2xl p-6 text-center">
          {vendor.logo ? (
            <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-2 border-border">
              <Image
                src={vendor.logo}
                alt={vendor.business_name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-surface border-2 border-border flex items-center justify-center">
              <span className="text-3xl font-semibold text-foreground">
                {vendor.business_name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <h3 className="text-lg font-semibold text-primary mb-1">
            {vendor.business_name}
          </h3>
          <p className="text-sm text-secondary uppercase mb-4">
            {vendor.category}
          </p>
          <button
            onClick={() => {
              // Open inquiry form or message vendor
              const bookingSidebar = document.querySelector('[data-booking-sidebar]');
              if (bookingSidebar) {
                const button = bookingSidebar.querySelector('button');
                button?.click();
              }
            }}
            className="w-full border-2 border-primary text-primary px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            Message Vendor
            </button>
        </div>

        {/* Placeholder for additional team members */}
        {/* When team_members table is added, map through team members here */}
        {teamSize > 1 && (
          <div className="text-center py-8 text-secondary">
            <p className="text-sm">
              {teamSize - 1} more {teamSize - 1 === 1 ? 'team member' : 'team members'}
            </p>
            <p className="text-xs mt-2">
              Team member profiles coming soon
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
