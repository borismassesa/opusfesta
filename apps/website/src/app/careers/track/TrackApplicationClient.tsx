"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Loader2, CheckCircle2, XCircle, Clock, FileText, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { CareersNavbar } from "@/components/careers/CareersNavbar";
import { CareersFooter } from "@/components/careers/CareersFooter";

interface ApplicationStatus {
  id: string;
  full_name: string;
  status: "pending" | "reviewing" | "interviewed" | "rejected" | "hired";
  created_at: string;
  updated_at: string;
  job_posting: {
    id: string;
    title: string;
    department: string;
  } | null;
}

export function TrackApplicationClient() {
  const [applicationId, setApplicationId] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [application, setApplication] = useState<ApplicationStatus | null>(null);

  // Immediately clear query parameters on mount (runs synchronously)
  if (typeof window !== "undefined" && window.location.search) {
    const url = new URL(window.location.href);
    const hasSensitiveParams = url.searchParams.has('id') || url.searchParams.has('email');
    
    if (hasSensitiveParams) {
      // Extract values before clearing
      const idParam = url.searchParams.get('id');
      const emailParam = url.searchParams.get('email');
      
      // Clear URL immediately (synchronous)
      window.history.replaceState({}, '', '/careers/track');
      
      // Store in sessionStorage for auto-fill
      if (idParam) {
        sessionStorage.setItem('track_application_id', idParam);
      }
      if (emailParam) {
        sessionStorage.setItem('track_application_email', emailParam);
      }
    } else if (url.search) {
      // Clear any other query params
      window.history.replaceState({}, '', '/careers/track');
    }
  }

  // Check for pre-filled data from sessionStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // Get stored values
    const storedId = sessionStorage.getItem('track_application_id');
    const storedEmail = sessionStorage.getItem('track_application_email');
    
    if (storedId) {
      setApplicationId(storedId);
      sessionStorage.removeItem('track_application_id');
    }
    if (storedEmail) {
      setEmail(storedEmail);
      sessionStorage.removeItem('track_application_email');
    }
  }, []);

  const trackApplication = useCallback(async (id: string, emailAddr: string) => {
    setIsLoading(true);
    setError(null);
    setApplication(null);

    try {
      const response = await fetch(
        `/api/careers/applications/track`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: id,
            email: emailAddr,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to track application");
      }

      setApplication(data.application);
    } catch (err: any) {
      console.error("Error tracking application:", err);
      setError(err.message || "Failed to track application. Please check your details and try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    trackApplication(applicationId, email);
  };

  const getStatusInfo = (status: string) => {
    const statusMap: Record<
      string,
      { label: string; color: string; icon: React.ReactNode; description: string }
    > = {
      pending: {
        label: "Pending",
        color: "bg-surface text-[#050505] border-border dark:bg-surface/50 dark:text-secondary dark:border-border/60",
        icon: <Clock className="w-3.5 h-3.5 text-current" />,
        description: "Your application has been received and is awaiting review.",
      },
      reviewing: {
        label: "Under Review",
        color: "bg-blue-100 text-[#050505] border-blue-300 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800/50",
        icon: <FileText className="w-3.5 h-3.5 text-current" />,
        description: "Your application is currently being reviewed by our team.",
      },
      interviewed: {
        label: "Interviewed",
        color: "bg-purple-50 text-[#050505] border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800/50",
        icon: <CheckCircle2 className="w-3.5 h-3.5 text-current" />,
        description: "You have completed the interview process. We'll be in touch soon.",
      },
      rejected: {
        label: "Not Selected",
        color: "bg-red-50 text-[#050505] border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800/50",
        icon: <XCircle className="w-3.5 h-3.5 text-current" />,
        description: "Thank you for your interest. Unfortunately, we've decided to move forward with other candidates.",
      },
      hired: {
        label: "Hired",
        color: "bg-green-50 text-[#050505] border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800/50",
        icon: <CheckCircle2 className="w-3.5 h-3.5 text-current" />,
        description: "Congratulations! We're excited to have you join our team.",
      },
    };

    return statusMap[status] || statusMap.pending;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <CareersNavbar />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 md:pt-20 md:pb-16">
          <div className="text-center mb-12 md:mb-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-primary mb-4 tracking-tight">
              Track Your Application
            </h1>
            <p className="text-secondary text-sm sm:text-base md:text-lg leading-relaxed font-light max-w-2xl mx-auto">
              Enter your application ID and email to check the status of your job application
            </p>
          </div>

          <div className="group relative bg-background border border-border rounded-2xl p-6 md:p-8 mb-8 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 overflow-hidden">
            {/* Gradient Accent on Hover */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-secondary to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="mb-6">
              <h2 className="text-xl md:text-2xl font-semibold text-primary mb-2">Application Details</h2>
              <p className="text-secondary text-sm font-light">
                Enter the information you received when you submitted your application
              </p>
            </div>
            
            <form onSubmit={handleTrack} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="applicationId" className="text-sm font-medium text-primary">Application ID</Label>
                <Input
                  id="applicationId"
                  type="text"
                  placeholder="Enter your application ID"
                  value={applicationId}
                  onChange={(e) => setApplicationId(e.target.value)}
                  required
                  className="border-border focus:border-primary focus:ring-primary/20"
                />
                <p className="text-xs text-secondary/70 font-light">
                  You received this ID when you submitted your application
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-primary">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-border focus:border-primary focus:ring-primary/20"
                />
                <p className="text-xs text-secondary/70 font-light">
                  Use the same email address you used when applying
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Tracking...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Track Application
                  </>
                )}
              </Button>
            </form>
          </div>

          {error && (
            <div className="border border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-950/20 rounded-2xl p-6 mb-8">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-800 dark:text-red-400 mb-1">Error</p>
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
            </div>
          )}

          {application && (
            <div className="group relative bg-background border border-border rounded-2xl p-6 md:p-8 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 overflow-hidden">
              {/* Gradient Accent on Hover */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-secondary to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-xl md:text-2xl font-semibold text-primary mb-2">Application Status</h2>
                    <p className="text-secondary text-sm font-light">
                      Application for {application.job_posting?.title || "Position"}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border",
                      getStatusInfo(application.status).color
                    )}>
                      {getStatusInfo(application.status).icon}
                      {getStatusInfo(application.status).label}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-primary mb-2">Status Information</h3>
                  <p className="text-sm text-secondary leading-relaxed font-light">
                    {getStatusInfo(application.status).description}
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-xs text-secondary/70 font-medium uppercase tracking-wide">Applicant Name</Label>
                    <p className="font-medium text-primary">{application.full_name}</p>
                  </div>
                  {application.job_posting && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-xs text-secondary/70 font-medium uppercase tracking-wide">Position</Label>
                        <p className="font-medium text-primary">{application.job_posting.title}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-secondary/70 font-medium uppercase tracking-wide">Department</Label>
                        <p className="font-medium text-primary">{application.job_posting.department}</p>
                      </div>
                    </>
                  )}
                  <div className="space-y-2">
                    <Label className="text-xs text-secondary/70 font-medium uppercase tracking-wide flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      Applied On
                    </Label>
                    <p className="font-medium text-primary">
                      {new Date(application.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-secondary/70 font-medium uppercase tracking-wide flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      Last Updated
                    </Label>
                    <p className="font-medium text-primary">
                      {new Date(application.updated_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {application.status === "pending" && (
                  <div className="p-4 bg-surface/50 border border-border/50 rounded-xl">
                    <p className="text-sm text-secondary leading-relaxed font-light">
                      <strong className="font-medium text-primary">What's next?</strong> Our team typically reviews applications within
                      3-5 business days. You'll receive an email update when your application status
                      changes.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <div className="mt-auto">
        <CareersFooter />
      </div>
    </div>
  );
}
