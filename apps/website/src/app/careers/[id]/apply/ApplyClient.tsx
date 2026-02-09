"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { JobApplicationForm } from "@/components/careers/JobApplicationForm";
import { JobPosting } from "@/lib/careers/jobs";
import { ArrowLeft, Loader2, Briefcase, MapPin, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CareersNavbar } from "@/components/careers/CareersNavbar";
import { CareersFooter } from "@/components/careers/CareersFooter";
import { useAuth } from "@clerk/nextjs";
import { useAuthGate } from "@/hooks/useAuthGate";

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
  const [authStatus, setAuthStatus] = useState<"restoring" | "verifying" | "authenticated" | "failed">("restoring");
  const [error, setError] = useState<string | null>(null);
  const [hasAlreadyApplied, setHasAlreadyApplied] = useState(false);

  const { isSignedIn, isLoaded: isAuthLoaded, getToken } = useAuth();
  const { requireAuth } = useAuthGate();

  // Authentication check - show modal instead of redirect
  useEffect(() => {
    if (!isAuthLoaded) return;

    if (!isSignedIn) {
      requireAuth("apply", () => {
        setIsCheckingAuth(false);
        setAuthStatus("authenticated");
      });
      return;
    }

    // User is authenticated
    setIsCheckingAuth(false);
    setAuthStatus("authenticated");
  }, [isAuthLoaded, isSignedIn]);

  useEffect(() => {
    if (isCheckingAuth) return; // Wait for auth check to complete

    async function loadJob() {
      try {
        const resolvedParams = await params;
        const id = resolvedParams.id;
        setJobId(id);

        // Get token to fetch full job details
        const token = await getToken();

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

        // Check if user has already applied to this job
        if (token) {
          try {
            const appResponse = await fetch("/api/careers/applications/my-applications", {
              headers: {
                "Authorization": `Bearer ${token}`,
              },
            });
            
            if (appResponse.ok) {
              const appData = await appResponse.json();
              const existingApp = appData.applications?.find(
                (app: any) => app.job_posting_id === id && !app.is_draft
              );
              if (existingApp) {
                setHasAlreadyApplied(true);
              }
            }
          } catch (err) {
            // Silently fail - we'll still show the form and let the API handle the duplicate check
            console.error("Error checking existing applications:", err);
          }
        }
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
    const statusMessage = 
      authStatus === "restoring" ? "Restoring session..." :
      authStatus === "verifying" ? "Verifying account..." :
      "Loading application form...";

    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 animate-spin text-primary mx-auto mb-3 sm:mb-4" />
          <p className="text-sm sm:text-base text-secondary mb-2">
            {statusMessage}
          </p>
          {authStatus === "failed" && error && (
            <div className="mt-4 max-w-md mx-auto">
              <p className="text-sm text-destructive mb-3">{error}</p>
              <Link href="/careers/login">
                <Button variant="outline" size="sm">
                  Go to Login
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (error || !job || !jobId) {
    return (
      <div className="min-h-screen bg-background">
        <CareersNavbar />
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-12">
          <div className="max-w-2xl mx-auto">
            <Link href="/careers">
              <Button variant="ghost" className="mb-4 sm:mb-6 text-sm sm:text-base">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Careers
              </Button>
            </Link>
            <div className="text-center py-12 sm:py-16 md:py-20">
              <div className="p-3 sm:p-4 bg-destructive/10 rounded-xl sm:rounded-2xl mb-4 inline-block">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <span className="text-2xl sm:text-3xl">⚠️</span>
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold mb-2 text-primary">Job Not Found</h3>
              <p className="text-sm sm:text-base text-destructive px-4">{error || "Job posting not found"}</p>
            </div>
          </div>
        </div>
        <CareersFooter />
      </div>
    );
  }

  const formattedSalary = formatSalary(job.salary_range);

  // Show message if user has already applied
  if (hasAlreadyApplied) {
    return (
      <div className="min-h-screen bg-background">
        <CareersNavbar />
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-12">
          <div className="max-w-2xl mx-auto">
            <Link href={`/careers/${jobId}`}>
              <Button variant="ghost" className="mb-4 sm:mb-6 text-sm sm:text-base">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Job Description
              </Button>
            </Link>
            <div className="text-center py-12 sm:py-16 md:py-20">
              <div className="p-3 sm:p-4 bg-primary/10 rounded-xl sm:rounded-2xl mb-4 inline-block">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold mb-2 text-primary">Application Already Submitted</h3>
              <p className="text-sm sm:text-base text-secondary px-4 mb-6">
                You have already submitted an application for this job posting. You can view your application status in{" "}
                <Link href="/careers/my-applications" className="text-primary hover:underline">
                  My Applications
                </Link>
                .
              </p>
              <Link href="/careers/my-applications">
                <Button>View My Applications</Button>
              </Link>
            </div>
          </div>
        </div>
        <CareersFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <CareersNavbar />
      
      {/* Main Content */}
      <section className="pt-20 pb-12 sm:pt-24 sm:pb-16 md:pt-32 md:pb-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
          {/* Back Button */}
          <div className="mb-6 sm:mb-8">
            <Link href={`/careers/${jobId}`}>
              <Button variant="ghost" className="group text-sm sm:text-base">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                <span className="hidden sm:inline">Back to Job Description</span>
                <span className="sm:hidden">Back</span>
              </Button>
            </Link>
          </div>

          {/* Centered Application Form */}
          <div className="max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto">
            <div className="bg-surface border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 lg:p-10">
              {/* Job Header */}
              <div className="mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-border">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary leading-tight mb-2 sm:mb-3">
                  {job.title}
                </h1>
                <p className="text-sm sm:text-base md:text-lg text-secondary wrap-break-word">
                  <span className="whitespace-nowrap">{job.department}</span>
                  <span className="mx-1 sm:mx-2">•</span>
                  <span className="whitespace-nowrap">{job.location}</span>
                  <span className="mx-1 sm:mx-2">•</span>
                  <span className="whitespace-nowrap">{job.employment_type}</span>
                </p>
              </div>

              {/* Form Header */}
              <div className="mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight text-primary mb-1 sm:mb-2">
                  Apply for this Position
                </h2>
                <p className="text-xs sm:text-sm text-secondary">
                  Fill out the form below to submit your application. We'll review it and get back to you soon.
                </p>
              </div>
              
              {/* Application Form */}
              <JobApplicationForm
                jobPostingId={jobId}
                jobTitle={job.title}
                onSuccess={handleSuccess}
              />
            </div>
          </div>
        </div>
      </section>

      <CareersFooter />
    </div>
  );
}
