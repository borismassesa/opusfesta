"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { JobApplicationForm } from "@/components/careers/JobApplicationForm";
import { JobPosting } from "@/lib/careers/jobs";
import { ArrowLeft, Loader2, Briefcase, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { MenuOverlay } from "@/components/layout/MenuOverlay";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/lib/supabaseClient";

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

export function ApplyClient({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [jobId, setJobId] = useState<string | null>(null);
  const [job, setJob] = useState<JobPosting | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Check authentication first - redirect immediately if not authenticated
  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        // If no session, redirect to login immediately
        if (!session || sessionError) {
          const currentPath = window.location.pathname;
          router.replace(`/login?next=${encodeURIComponent(currentPath)}`);
          return;
        }

        // Verify user exists in the database
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id")
          .eq("id", session.user.id)
          .single();

        // If user doesn't exist in database, redirect to login
        if (userError || !userData) {
          const currentPath = window.location.pathname;
          router.replace(`/login?next=${encodeURIComponent(currentPath)}`);
          return;
        }

        // Only set checking to false if user is authenticated and exists in database
        setIsCheckingAuth(false);
      } catch (err) {
        console.error("Error checking auth:", err);
        const currentPath = window.location.pathname;
        router.replace(`/login?next=${encodeURIComponent(currentPath)}`);
      }
    }

    checkAuth();
  }, [router]);

  useEffect(() => {
    if (isCheckingAuth) return; // Wait for auth check to complete

    async function loadJob() {
      try {
        const resolvedParams = await params;
        const id = resolvedParams.id;
        setJobId(id);

        // Get session token to fetch full job details
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        const headers: HeadersInit = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch("/api/careers/jobs", {
          headers,
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch job posting");
        }

        const data = await response.json();
        const jobPosting = data.jobs.find((j: JobPosting) => j.id === id);

        if (!jobPosting) {
          throw new Error("Job posting not found");
        }

        setJob(jobPosting);
      } catch (err: any) {
        setError(err.message || "Failed to load job posting");
      } finally {
        setIsLoading(false);
      }
    }

    loadJob();
  }, [params, isCheckingAuth]);

  const handleSuccess = () => {
    router.push("/careers?success=true");
  };

  if (isCheckingAuth || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-secondary">
            {isCheckingAuth ? "Verifying authentication..." : "Loading application form..."}
          </p>
        </div>
      </div>
    );
  }

  if (error || !job || !jobId) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar isOpen={menuOpen} onMenuClick={() => setMenuOpen(!menuOpen)} />
        <MenuOverlay isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12">
          <div className="max-w-2xl mx-auto">
            <Link href="/careers">
              <Button variant="ghost" className="mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Careers
              </Button>
            </Link>
            <div className="text-center py-20">
              <div className="p-4 bg-destructive/10 rounded-2xl mb-4 inline-block">
                <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">⚠️</span>
                </div>
              </div>
              <h3 className="text-2xl font-semibold mb-2 text-primary">Job Not Found</h3>
              <p className="text-destructive">{error || "Job posting not found"}</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const formattedSalary = formatSalary(job.salary_range);

  return (
    <div className="min-h-screen bg-background">
      <Navbar isOpen={menuOpen} onMenuClick={() => setMenuOpen(!menuOpen)} />
      <MenuOverlay isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      
      {/* Main Content - Two Column Layout */}
      <section className="pt-24 pb-20 md:pt-32 md:pb-32">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <Link href="/careers">
            <Button variant="ghost" className="mb-8 group">
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Careers
            </Button>
          </Link>

          <div className="grid lg:grid-cols-[1fr_1fr] gap-12 lg:gap-16 items-start">
            {/* Left Column - Job Details */}
            <div className="lg:sticky lg:top-24">
              {/* Job Header */}
              <div className="mb-8">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary leading-[1.1] tracking-tight mb-4">
                  {job.title}
                </h1>
                <p className="text-base md:text-lg text-secondary mb-6">
                  {job.department} | {job.location} | {job.employment_type}
                </p>
              </div>

              {/* Job Details Content */}
              <div className="space-y-8 text-secondary leading-relaxed">
                {/* About TheFesta */}
                {job.about_thefesta && (
                  <div>
                    <h2 className="text-xl md:text-2xl font-semibold text-primary mb-4">About TheFesta</h2>
                    <div 
                      className="text-sm md:text-base leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: job.about_thefesta }}
                    />
                  </div>
                )}

                {/* The Role */}
                <div>
                  <h2 className="text-xl md:text-2xl font-semibold text-primary mb-4">The Role</h2>
                  {job.description ? (
                    <div 
                      className="text-sm md:text-base leading-relaxed prose prose-sm max-w-none prose-p:text-secondary prose-p:leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: job.description }}
                    />
                  ) : (
                    <>
                      <p className="text-sm md:text-base leading-relaxed">
                        We are looking for a {job.title} to join our {job.department} team at TheFesta. In this role, you will play a key part in delivering high-quality solutions while working closely with cross-functional teams.
                      </p>
                      <p className="text-sm md:text-base leading-relaxed mt-3">
                        This is an opportunity to make a real impact, take ownership of your work, and grow your career in a supportive and dynamic environment.
                      </p>
                    </>
                  )}
                </div>

                {/* What You'll Do */}
                {job.responsibilities && job.responsibilities.length > 0 && (
                  <div>
                    <h2 className="text-xl md:text-2xl font-semibold text-primary mb-4">What You'll Do</h2>
                    <ul className="space-y-2.5 text-sm md:text-base">
                      {job.responsibilities.map((resp, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="text-primary mt-1.5 shrink-0 font-bold">•</span>
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* What We're Looking For */}
                {job.requirements && job.requirements.length > 0 && (
                  <div>
                    <h2 className="text-xl md:text-2xl font-semibold text-primary mb-4">What We're Looking For</h2>
                    <ul className="space-y-2.5 text-sm md:text-base">
                      {job.requirements.map((req, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="text-primary mt-1.5 shrink-0 font-bold">•</span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Why You'll Love Working at TheFesta */}
                {job.benefits && job.benefits.length > 0 && (
                  <div>
                    <h2 className="text-xl md:text-2xl font-semibold text-primary mb-4">Why You'll Love Working at TheFesta</h2>
                    <ul className="space-y-2.5 text-sm md:text-base">
                      {job.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="text-primary mt-1.5 shrink-0 font-bold">•</span>
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Work Arrangement */}
                <div>
                  <h2 className="text-xl md:text-2xl font-semibold text-primary mb-4">Work Arrangement</h2>
                  <ul className="space-y-1.5 text-sm md:text-base">
                    <li className="flex items-start gap-3">
                      <span className="text-secondary">Location:</span>
                      <span className="text-primary font-medium">{job.location}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-secondary">Employment Type:</span>
                      <span className="text-primary font-medium">{job.employment_type}</span>
                    </li>
                  </ul>
                </div>

                {/* Growth at TheFesta */}
                {job.growth_description && (
                  <div>
                    <h2 className="text-xl md:text-2xl font-semibold text-primary mb-4">Growth at TheFesta</h2>
                    <div 
                      className="text-sm md:text-base leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: job.growth_description }}
                    />
                  </div>
                )}

                {/* Our Hiring Process */}
                {job.hiring_process && job.hiring_process.length > 0 && (
                  <div>
                    <h2 className="text-xl md:text-2xl font-semibold text-primary mb-4">Our Hiring Process</h2>
                    <ol className="space-y-2.5 text-sm md:text-base list-decimal list-inside">
                      {job.hiring_process.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* How to Apply */}
                {job.how_to_apply && (
                  <div>
                    <h2 className="text-xl md:text-2xl font-semibold text-primary mb-4">How to Apply</h2>
                    <div 
                      className="text-sm md:text-base leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: job.how_to_apply }}
                    />
                  </div>
                )}

                {/* Equal Opportunity Statement */}
                {job.equal_opportunity_statement && (
                  <div className="pt-6 border-t border-border">
                    <h2 className="text-lg md:text-xl font-semibold text-primary mb-3">Equal Opportunity Statement</h2>
                    <div 
                      className="text-xs md:text-sm text-secondary leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: job.equal_opportunity_statement }}
                    />
                  </div>
                )}

                {/* Compensation */}
                {formattedSalary && (
                  <div className="pt-6 border-t border-border">
                    <h2 className="text-xl md:text-2xl font-semibold text-primary mb-2">Compensation</h2>
                    <p className="text-base font-semibold text-primary">{formattedSalary}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Application Form */}
            <div className="lg:sticky lg:top-24">
              <div className="bg-surface border border-border rounded-2xl p-6 md:p-8">
                <div className="mb-6">
                  <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-primary mb-2">
                    Apply for this Position
                  </h2>
                  <p className="text-sm text-secondary">
                    Fill out the form below to submit your application. We'll review it and get back to you soon.
                  </p>
                </div>
                <JobApplicationForm
                  jobPostingId={jobId}
                  jobTitle={job.title}
                  onSuccess={handleSuccess}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
