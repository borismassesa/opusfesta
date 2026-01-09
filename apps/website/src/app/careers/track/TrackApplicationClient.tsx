"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Loader2, CheckCircle2, XCircle, Clock, FileText, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/layout/Navbar";
import { MenuOverlay } from "@/components/layout/MenuOverlay";
import { Footer } from "@/components/layout/Footer";

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
  const [menuOpen, setMenuOpen] = useState(false);
  const [applicationId, setApplicationId] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [application, setApplication] = useState<ApplicationStatus | null>(null);

  const trackApplication = useCallback(async (id: string, emailAddr: string) => {
    setIsLoading(true);
    setError(null);
    setApplication(null);

    try {
      const response = await fetch(
        `/api/careers/applications/track?id=${encodeURIComponent(id)}&email=${encodeURIComponent(emailAddr)}`
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

  // Check for URL parameters
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const emailParam = params.get("email");
    
    if (id) setApplicationId(id);
    if (emailParam) setEmail(emailParam);
    
    // Auto-track if both are provided
    if (id && emailParam) {
      trackApplication(id, emailParam);
    }
  }, [trackApplication]);

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
        color: "bg-yellow-100 text-yellow-800 border-yellow-300",
        icon: <Clock className="w-4 h-4" />,
        description: "Your application has been received and is awaiting review.",
      },
      reviewing: {
        label: "Under Review",
        color: "bg-blue-100 text-blue-800 border-blue-300",
        icon: <FileText className="w-4 h-4" />,
        description: "Your application is currently being reviewed by our team.",
      },
      interviewed: {
        label: "Interviewed",
        color: "bg-purple-100 text-purple-800 border-purple-300",
        icon: <CheckCircle2 className="w-4 h-4" />,
        description: "You have completed the interview process. We'll be in touch soon.",
      },
      rejected: {
        label: "Not Selected",
        color: "bg-red-100 text-red-800 border-red-300",
        icon: <XCircle className="w-4 h-4" />,
        description: "Thank you for your interest. Unfortunately, we've decided to move forward with other candidates.",
      },
      hired: {
        label: "Hired",
        color: "bg-green-100 text-green-800 border-green-300",
        icon: <CheckCircle2 className="w-4 h-4" />,
        description: "Congratulations! We're excited to have you join our team.",
      },
    };

    return statusMap[status] || statusMap.pending;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar isOpen={menuOpen} onMenuClick={() => setMenuOpen(!menuOpen)} />
      <MenuOverlay isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <main className="flex-1">
        <div className="container mx-auto px-4 pt-16 pb-12 md:pt-20 md:pb-16 max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Track Your Application</h1>
            <p className="text-muted-foreground">
              Enter your application ID and email to check the status of your job application
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Application Details</CardTitle>
              <CardDescription>
                Enter the information you received when you submitted your application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTrack} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="applicationId">Application ID</Label>
                  <Input
                    id="applicationId"
                    type="text"
                    placeholder="Enter your application ID"
                    value={applicationId}
                    onChange={(e) => setApplicationId(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    You received this ID when you submitted your application
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
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
            </CardContent>
          </Card>

          {error && (
            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-destructive mt-0.5" />
                  <div>
                    <p className="font-semibold text-destructive mb-1">Error</p>
                    <p className="text-sm text-destructive/80">{error}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {application && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Application Status</CardTitle>
                    <CardDescription>
                      Application for {application.job_posting?.title || "Position"}
                    </CardDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn("font-medium", getStatusInfo(application.status).color)}
                  >
                    <span className="flex items-center gap-2">
                      {getStatusInfo(application.status).icon}
                      {getStatusInfo(application.status).label}
                    </span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Status Information</h3>
                  <p className="text-sm text-muted-foreground">
                    {getStatusInfo(application.status).description}
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Applicant Name</Label>
                    <p className="font-medium">{application.full_name}</p>
                  </div>
                  {application.job_posting && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Position</Label>
                        <p className="font-medium">{application.job_posting.title}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Department</Label>
                        <p className="font-medium">{application.job_posting.department}</p>
                      </div>
                    </>
                  )}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      Applied On
                    </Label>
                    <p className="font-medium">
                      {new Date(application.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      Last Updated
                    </Label>
                    <p className="font-medium">
                      {new Date(application.updated_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {application.status === "pending" && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>What's next?</strong> Our team typically reviews applications within
                      3-5 business days. You'll receive an email update when your application status
                      changes.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
