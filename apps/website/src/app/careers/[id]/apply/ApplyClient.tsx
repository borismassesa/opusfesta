"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { JobApplicationForm } from "@/components/careers/JobApplicationForm";
import { JobPosting } from "@/lib/careers/jobs";
import { ArrowLeft, Loader2, Briefcase, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CareersNavbar } from "@/components/careers/CareersNavbar";
import { CareersFooter } from "@/components/careers/CareersFooter";
import { supabase } from "@/lib/supabaseClient";
import { ensureUserRecord } from "@/lib/auth";

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

  // Improved authentication check with session restoration wait and retry logic
  useEffect(() => {
    let mounted = true;
    let sessionRestored = false;
    let verificationInProgress = false;
    let verificationTimeoutId: NodeJS.Timeout | null = null;
    const maxRetries = 3;
    const sessionRestoreTimeout = 3000; // 3 seconds max wait for session restoration
    const verificationTimeout = 10000; // 10 seconds max for verification

    const redirectToLogin = (currentPath: string) => {
      if (!mounted) return;
      sessionStorage.setItem("auth_redirect", currentPath);
      // Redirect to careers login (user can sign up from there if needed)
      router.replace(`/careers/login?next=${encodeURIComponent(currentPath)}`);
    };

    const verifyUserRecord = async (session: any, retryAttempt = 0): Promise<boolean> => {
      if (!mounted || verificationInProgress) return false;
      verificationInProgress = true;

      // Set up a timeout that will redirect if verification takes too long
      const setupVerificationTimeout = () => {
        if (verificationTimeoutId) clearTimeout(verificationTimeoutId);
        verificationTimeoutId = setTimeout(() => {
          if (mounted && verificationInProgress) {
            console.warn("Verification timeout - redirecting to login");
            verificationInProgress = false;
            const currentPath = window.location.pathname;
            redirectToLogin(currentPath);
          }
        }, verificationTimeout);
      };

      try {
        setAuthStatus("verifying");
        setupVerificationTimeout();
        
        // CRITICAL: First verify user still exists in Supabase Auth
        const userCheckResult = await supabase.auth.getUser();
        
        if (verificationTimeoutId) {
          clearTimeout(verificationTimeoutId);
          verificationTimeoutId = null;
        }

        if (!mounted) {
          verificationInProgress = false;
          return false;
        }

        const userExistsInAuth = !userCheckResult.error && 
                                userCheckResult.data?.user && 
                                userCheckResult.data.user.id === session.user.id;

        if (!userExistsInAuth) {
          // User was deleted from Auth - sign out
          console.warn("User deleted from Auth, signing out");
          await supabase.auth.signOut();
          if (mounted) {
            const currentPath = window.location.pathname;
            redirectToLogin(currentPath);
          }
          verificationInProgress = false;
          return false;
        }
        
        setupVerificationTimeout();
        
        // Use ensureUserRecord which creates the record if it doesn't exist
        const result = await ensureUserRecord(session);
        
        if (verificationTimeoutId) {
          clearTimeout(verificationTimeoutId);
          verificationTimeoutId = null;
        }
        
        if (!mounted) {
          verificationInProgress = false;
          return false;
        }
        
        if (result.success) {
          if (mounted) {
            setIsCheckingAuth(false);
            setAuthStatus("authenticated");
          }
          verificationInProgress = false;
          return true;
        } else {
          // If it's a transient error and we haven't exceeded retries, try again
          if (retryAttempt < maxRetries) {
            console.log(`User record verification failed, retrying... (attempt ${retryAttempt + 1}/${maxRetries})`);
            verificationInProgress = false;
            await new Promise(resolve => setTimeout(resolve, 1000 * (retryAttempt + 1))); // Exponential backoff
            return verifyUserRecord(session, retryAttempt + 1);
          } else {
            console.error("Failed to verify/create user record after retries:", result.error);
            if (mounted) {
              const currentPath = window.location.pathname;
              redirectToLogin(currentPath);
            }
            verificationInProgress = false;
            return false;
          }
        }
      } catch (err) {
        if (verificationTimeoutId) {
          clearTimeout(verificationTimeoutId);
          verificationTimeoutId = null;
        }
        
        console.error("Error verifying user record:", err);
        
        // Retry on transient errors
        if (retryAttempt < maxRetries && err instanceof Error) {
          const isTransientError = 
            err.message?.includes("network") ||
            err.message?.includes("timeout") ||
            err.message?.includes("fetch");
          
          if (isTransientError) {
            console.log(`Transient error detected, retrying... (attempt ${retryAttempt + 1}/${maxRetries})`);
            verificationInProgress = false;
            await new Promise(resolve => setTimeout(resolve, 1000 * (retryAttempt + 1)));
            return verifyUserRecord(session, retryAttempt + 1);
          }
        }
        
        if (mounted) {
          const currentPath = window.location.pathname;
          redirectToLogin(currentPath);
        }
        verificationInProgress = false;
        return false;
      }
    };

    // Set timeout for session restoration
    const timeout = setTimeout(() => {
      if (!sessionRestored && mounted && !verificationInProgress) {
        console.warn("Session restoration timeout - checking current session");
        sessionRestored = true;
        
        // Check if we have a session despite timeout
        supabase.auth.getSession().then(({ data: { session }, error: sessionError }) => {
          if (!mounted) return;
          
          if (!session || sessionError) {
            const currentPath = window.location.pathname;
            redirectToLogin(currentPath);
          } else {
            verifyUserRecord(session);
          }
        }).catch((err) => {
          console.error("Error getting session after timeout:", err);
          if (mounted) {
            const currentPath = window.location.pathname;
            redirectToLogin(currentPath);
          }
        });
      }
    }, sessionRestoreTimeout);

    // Listen for auth state changes (handles session restoration, refresh, sign in/out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        // Mark session as restored
        if (!sessionRestored) {
          sessionRestored = true;
          clearTimeout(timeout);
        }

        // Handle different auth events
        if (event === "SIGNED_OUT" || !session) {
          const currentPath = window.location.pathname;
          redirectToLogin(currentPath);
          return;
        }

        // For SIGNED_IN, TOKEN_REFRESHED, USER_UPDATED, or INITIAL_SESSION events, verify user record
        if (
          event === "SIGNED_IN" || 
          event === "TOKEN_REFRESHED" || 
          event === "USER_UPDATED" ||
          event === "INITIAL_SESSION"
        ) {
          await verifyUserRecord(session);
        }
      }
    );

    // Initial session check (in case session is already available)
    supabase.auth.getSession().then(({ data: { session }, error: sessionError }) => {
      if (!mounted) return;

      // If we already got a session from onAuthStateChange, skip
      if (sessionRestored) return;

      if (sessionError) {
        console.error("Session error:", sessionError);
        const currentPath = window.location.pathname;
        redirectToLogin(currentPath);
        return;
      }

      if (!session) {
        // No session - wait a bit for onAuthStateChange to fire
        // If it doesn't fire within timeout, we'll redirect
        // Don't mark as restored yet - let timeout handle it
        return;
      }

      // We have a session - verify user record
      if (!sessionRestored) {
        sessionRestored = true;
        clearTimeout(timeout);
        verifyUserRecord(session).catch((err) => {
          console.error("Error in verifyUserRecord from initial check:", err);
          if (mounted) {
            const currentPath = window.location.pathname;
            redirectToLogin(currentPath);
          }
        });
      }
    }).catch((err) => {
      console.error("Error getting initial session:", err);
      if (mounted && !sessionRestored) {
        const currentPath = window.location.pathname;
        redirectToLogin(currentPath);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(timeout);
      if (verificationTimeoutId) {
        clearTimeout(verificationTimeoutId);
        verificationTimeoutId = null;
      }
    };
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
    const statusMessage = 
      authStatus === "restoring" ? "Restoring session..." :
      authStatus === "verifying" ? "Verifying account..." :
      "Loading application form...";

    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 animate-spin text-primary mx-auto mb-3 sm:mb-4" />
          <p className="text-sm sm:text-base text-secondary">
            {statusMessage}
          </p>
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
                <p className="text-sm sm:text-base md:text-lg text-secondary break-words">
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
