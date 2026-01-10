"use client";

import { useEffect, useState } from "react";
import { JobPosting } from "@/lib/careers/jobs";
import { fetchJobPostings } from "@/lib/careers/jobs";
import { ArrowLeft, MapPin, Briefcase, Clock, Share2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CareersNavbar } from "@/components/careers/CareersNavbar";
import { CareersFooter } from "@/components/careers/CareersFooter";

function formatSalary(salaryRange: string | null): string | null {
  if (!salaryRange) return null;
  const match = salaryRange.match(/(\d+(?:,\d+)*)/g);
  if (match && match.length >= 2) {
    const min = parseInt(match[0].replace(/,/g, "")) / 1000000;
    const max = parseInt(match[1].replace(/,/g, "")) / 1000000;
    return `TZS ${min}M - ${max}M`;
  }
  return salaryRange;
}

export function JobDescriptionClient({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [jobId, setJobId] = useState<string | null>(null);
  const [job, setJob] = useState<JobPosting | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load job details - PUBLIC, no authentication required
  useEffect(() => {
    async function loadJob() {
      try {
        const resolvedParams = await params;
        const id = resolvedParams.id;
        setJobId(id);

        // Fetch jobs without authentication - descriptions are public
        const jobPostings = await fetchJobPostings();
        const foundJob = jobPostings.find((j: JobPosting) => j.id === id);

        if (!foundJob) {
          throw new Error("Job posting not found");
        }

        setJob(foundJob);
      } catch (err: any) {
        console.error("Error loading job:", err);
        setError(err.message || "Failed to load job posting");
      } finally {
        setIsLoading(false);
      }
    }

    loadJob();
  }, [params]);

  const handleShare = () => {
    if (navigator.share && job) {
      navigator.share({
        title: `${job.title} at OpusFesta`,
        text: `Check out this job opportunity: ${job.title}`,
        url: window.location.href,
      }).catch(() => {
        // Fallback to copy
        navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      });
    } else {
      // Fallback to copy
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <CareersNavbar />
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-24">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-secondary">Loading job details...</p>
          </div>
        </div>
        <CareersFooter />
      </div>
    );
  }

  if (error || !job || !jobId) {
    return (
      <div className="min-h-screen bg-background">
        <CareersNavbar />
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-24">
          <Link href="/careers/positions">
            <Button variant="ghost" className="mb-8">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Positions
            </Button>
          </Link>
          <div className="text-center py-20">
            <div className="p-4 bg-destructive/10 rounded-2xl mb-4 inline-block">
              <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚠️</span>
              </div>
            </div>
            <h3 className="text-2xl font-semibold mb-2 text-primary">Job Not Found</h3>
            <p className="text-destructive mb-6">{error || "Job posting not found"}</p>
            <Link href="/careers/positions">
              <Button>Browse All Positions</Button>
            </Link>
          </div>
        </div>
        <CareersFooter />
      </div>
    );
  }

  const formattedSalary = formatSalary(job.salary_range);

  // Structured data for SEO
  const structuredData = job ? {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": job.title,
    "description": job.description?.replace(/<[^>]*>/g, '') || "",
    "datePosted": job.created_at,
    "employmentType": job.employment_type,
    "hiringOrganization": {
      "@type": "Organization",
      "name": "OpusFesta",
      "sameAs": process.env.NEXT_PUBLIC_WEBSITE_URL || "https://opusfesta.com"
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": job.location,
        "addressCountry": "TZ"
      }
    },
    "baseSalary": job.salary_range ? {
      "@type": "MonetaryAmount",
      "currency": "TZS",
      "value": {
        "@type": "QuantitativeValue",
        "value": job.salary_range
      }
    } : undefined,
    "workHours": job.employment_type,
    "industry": "Technology",
    "occupationalCategory": job.department
  } : null;

  return (
    <div className="min-h-screen bg-background">
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      <CareersNavbar />
      
      {/* Main Content */}
      <section className="pt-24 pb-20 md:pt-32 md:pb-32">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          {/* Back Button */}
          <Link href="/careers/positions">
            <Button variant="ghost" className="mb-8 group">
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Positions
            </Button>
          </Link>

          {/* Job Header */}
          <div className="mb-8 pb-8 border-b border-border">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary leading-[1.1] tracking-tight mb-4">
                  {job.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-base md:text-lg text-secondary mb-4">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    <span>{job.department}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{job.location}</span>
                  </div>
                  <span>•</span>
                  <span>{job.employment_type}</span>
                </div>
                {formattedSalary && (
                  <div className="flex items-center gap-2 text-primary font-semibold">
                    <Clock className="w-4 h-4" />
                    <span>{formattedSalary}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleShare}
                  title="Share this job"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Job Details Content */}
          <div className="space-y-10 text-secondary leading-relaxed mb-12">
            {/* About OpusFesta */}
            {job.about_thefesta && (
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-4">About OpusFesta</h2>
                <div 
                  className="text-base md:text-lg leading-relaxed prose prose-lg max-w-none prose-p:text-secondary prose-p:leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: job.about_thefesta }}
                />
              </div>
            )}

            {/* The Role */}
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-4">The Role</h2>
              {job.description ? (
                <div 
                  className="text-base md:text-lg leading-relaxed prose prose-lg max-w-none prose-p:text-secondary prose-p:leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: job.description }}
                />
              ) : (
                <p className="text-base md:text-lg text-secondary leading-relaxed">
                  We are looking for a {job.title} to join our {job.department} team at OpusFesta. 
                  In this role, you will play a key part in delivering high-quality solutions while working closely with cross-functional teams.
                </p>
              )}
            </div>

            {/* What You'll Do */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-4">What You'll Do</h2>
                <ul className="space-y-3 text-base md:text-lg">
                  {job.responsibilities.map((resp, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-primary mt-2 shrink-0 font-bold text-xl">•</span>
                      <span className="leading-relaxed">{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* What We're Looking For */}
            {job.requirements && job.requirements.length > 0 && (
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-4">What We're Looking For</h2>
                <ul className="space-y-3 text-base md:text-lg">
                  {job.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-primary mt-2 shrink-0 font-bold text-xl">•</span>
                      <span className="leading-relaxed">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Why You'll Love Working at OpusFesta */}
            {job.benefits && job.benefits.length > 0 && (
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-4">Why You'll Love Working at OpusFesta</h2>
                <ul className="space-y-3 text-base md:text-lg">
                  {job.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-primary mt-2 shrink-0 font-bold text-xl">•</span>
                      <span className="leading-relaxed">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Work Arrangement */}
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-4">Work Arrangement</h2>
              <div className="space-y-2 text-base md:text-lg">
                <div className="flex items-center gap-3">
                  <span className="text-secondary font-medium">Location:</span>
                  <span className="text-primary">{job.location}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-secondary font-medium">Employment Type:</span>
                  <span className="text-primary">{job.employment_type}</span>
                </div>
              </div>
            </div>

            {/* Growth at OpusFesta */}
            {job.growth_description && (
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-4">Growth at OpusFesta</h2>
                <div 
                  className="text-base md:text-lg leading-relaxed prose prose-lg max-w-none prose-p:text-secondary prose-p:leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: job.growth_description }}
                />
              </div>
            )}

            {/* Our Hiring Process */}
            {job.hiring_process && job.hiring_process.length > 0 && (
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-4">Our Hiring Process</h2>
                <ol className="space-y-3 text-base md:text-lg list-decimal list-inside ml-4">
                  {job.hiring_process.map((step, idx) => (
                    <li key={idx} className="leading-relaxed">{step}</li>
                  ))}
                </ol>
              </div>
            )}

            {/* How to Apply */}
            {job.how_to_apply && (
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-4">How to Apply</h2>
                <div 
                  className="text-base md:text-lg leading-relaxed prose prose-lg max-w-none prose-p:text-secondary prose-p:leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: job.how_to_apply }}
                />
              </div>
            )}

            {/* Equal Opportunity Statement */}
            {job.equal_opportunity_statement && (
              <div className="pt-8 border-t border-border">
                <h2 className="text-xl md:text-2xl font-semibold text-primary mb-4">Equal Opportunity Statement</h2>
                <div 
                  className="text-sm md:text-base text-secondary leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: job.equal_opportunity_statement }}
                />
              </div>
            )}
          </div>

          {/* Apply CTA Section */}
          <div className="sticky bottom-0 bg-background border-t border-border -mx-6 lg:-mx-12 px-6 lg:px-12 py-6 mt-12 shadow-lg">
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-primary mb-1">Ready to apply?</h3>
                <p className="text-sm text-secondary">Submit your application and join our team</p>
              </div>
              <Link 
                href={`/careers/${jobId}/apply`} 
                className="w-full sm:w-auto"
              >
                <Button size="lg" className="w-full sm:w-auto text-base px-8">
                  Apply Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <CareersFooter />
    </div>
  );
}
