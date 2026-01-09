"use client";

import { MapPin, Briefcase, DollarSign, ArrowRight, Clock, Building2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobPosting } from "@/lib/careers/jobs";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface JobListingCardProps {
  job: JobPosting;
}

export function JobListingCard({ job }: JobListingCardProps) {
  return (
    <div className="group relative h-full flex flex-col border border-border rounded-2xl overflow-hidden bg-card hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
      {/* Gradient Accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="p-6 md:p-8 flex flex-col flex-1">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-xl md:text-2xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                {job.title}
              </h3>
              
              {/* Department Badge */}
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary" className="gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  {job.department}
                </Badge>
              </div>
            </div>
          </div>

          {/* Job Details */}
          <div className="flex flex-wrap gap-3 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="w-4 h-4 text-primary/60" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="w-4 h-4 text-primary/60" />
              <span>{job.employment_type}</span>
            </div>
            {job.salary_range && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <DollarSign className="w-4 h-4 text-primary/60" />
                <span>{job.salary_range}</span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="flex-1 mb-6">
          {job.description ? (
            <p className="text-sm md:text-base text-muted-foreground line-clamp-4 leading-relaxed">
              {job.description}
            </p>
          ) : (
            <div 
              className="p-4 bg-surface border border-border rounded-lg cursor-pointer hover:bg-primary/5 transition-colors"
              onClick={() => {
                window.location.href = `/login?next=${encodeURIComponent('/careers')}`;
              }}
            >
              <div className="flex items-center gap-3 text-sm">
                <Lock className="w-4 h-4 text-primary" />
                <div className="flex-1">
                  <p className="text-muted-foreground font-medium mb-1">
                    Job description available after login
                  </p>
                  <Link
                    href={`/login?next=${encodeURIComponent('/careers')}`}
                    className="text-primary hover:underline text-xs"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Log in to view full details
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Requirements Preview */}
        {job.requirements && job.requirements.length > 0 ? (
          <div className="mb-6 pb-6 border-b border-border">
            <p className="text-xs font-medium text-muted-foreground mb-2">Key Requirements:</p>
            <ul className="space-y-1">
              {job.requirements.slice(0, 2).map((req, idx) => (
                <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-1.5">•</span>
                  <span className="line-clamp-1">{req}</span>
                </li>
              ))}
              {job.requirements.length > 2 && (
                <li className="text-xs text-primary font-medium">
                  +{job.requirements.length - 2} more requirements
                </li>
              )}
            </ul>
          </div>
        ) : !job.description && (
          <div className="mb-6 pb-6 border-b border-border">
            <p className="text-xs font-medium text-muted-foreground mb-2">Key Requirements:</p>
            <div className="p-3 bg-surface border border-border rounded-lg">
              <p className="text-xs text-muted-foreground">
                <Lock className="w-3 h-3 inline mr-1" />
                Log in to view requirements
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-4">
          <Link href={`/careers/${job.id}`} className="block">
            <Button 
              className="w-full group/btn bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
              size="lg"
            >
              View Details
              <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:via-primary/0 group-hover:to-primary/5 transition-all duration-300 pointer-events-none rounded-2xl"></div>
    </div>
  );
}
