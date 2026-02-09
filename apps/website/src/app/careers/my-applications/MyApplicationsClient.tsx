"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { CheckCircle2, Clock, XCircle, Calendar, Search, Filter, FileText, Briefcase, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { CareersNavbar } from "@/components/careers/CareersNavbar";
import { CareersFooter } from "@/components/careers/CareersFooter";

interface Application {
  id: string;
  job_posting_id: string;
  full_name: string;
  email: string;
  phone: string;
  status: string;
  is_draft: boolean;
  created_at: string;
  updated_at: string;
  job_postings: {
    id: string;
    title: string;
    department: string;
    location: string;
    employment_type: string;
  } | null;
}

export function MyApplicationsClient() {
  const router = useRouter();
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push(`/careers/login?next=${encodeURIComponent('/careers/my-applications')}`);
      return;
    }
    fetchApplications();
  }, [statusFilter, isLoaded, isSignedIn]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await getToken();
      if (!token) {
        router.push(`/careers/login?next=${encodeURIComponent('/careers/my-applications')}`);
        return;
      }

      const url = statusFilter === "all"
        ? "/api/careers/applications/my-applications?includeDrafts=true"
        : `/api/careers/applications/my-applications?status=${statusFilter}&includeDrafts=true`;

      const response = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch applications");
      }

      const data = await response.json();
      setApplications(data.applications || []);
    } catch (err: any) {
      console.error("Error fetching applications:", err);
      setError(err.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string, isDraft: boolean) => {
    if (isDraft) {
      return <FileText className="w-3.5 h-3.5 text-current" />;
    }
    switch (status) {
      case 'hired':
      case 'offer_accepted':
        return <CheckCircle2 className="w-3.5 h-3.5 text-current" />;
      case 'pending':
      case 'reviewing':
      case 'phone_screen':
      case 'technical_interview':
      case 'final_interview':
      case 'offer_extended':
        return <Clock className="w-3.5 h-3.5 text-current" />;
      case 'rejected':
      case 'offer_declined':
        return <XCircle className="w-3.5 h-3.5 text-current" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-current" />;
    }
  };

  const getStatusColor = (status: string, isDraft: boolean) => {
    if (isDraft) {
      return 'bg-blue-100 text-[#050505] border-blue-300 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800/50';
    }
    switch (status) {
      case 'hired':
      case 'offer_accepted':
        return 'bg-green-50 text-[#050505] border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800/50';
      case 'pending':
      case 'reviewing':
      case 'phone_screen':
      case 'technical_interview':
      case 'final_interview':
      case 'offer_extended':
        return 'bg-surface text-[#050505] border-border dark:bg-surface/50 dark:text-secondary dark:border-border/60';
      case 'rejected':
      case 'offer_declined':
        return 'bg-red-50 text-[#050505] border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800/50';
      default:
        return 'bg-surface text-secondary border-border dark:bg-surface/50 dark:text-secondary/70';
    }
  };

  const getStatusLabel = (status: string, isDraft: boolean) => {
    if (isDraft) return "Draft";
    const statusMap: Record<string, string> = {
      pending: "Pending",
      reviewing: "Under Review",
      phone_screen: "Phone Screen",
      technical_interview: "Technical Interview",
      final_interview: "Final Interview",
      interviewed: "Interviewed",
      offer_extended: "Offer Extended",
      offer_accepted: "Offer Accepted",
      offer_declined: "Offer Declined",
      rejected: "Not Selected",
      hired: "Hired",
    };
    return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1);
  };

  const filteredApplications = applications.filter((app) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      app.job_postings?.title.toLowerCase().includes(query) ||
      app.job_postings?.department.toLowerCase().includes(query) ||
      app.full_name.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <CareersNavbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
            <p className="text-secondary">Loading your applications...</p>
          </div>
        </div>
        <CareersFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <CareersNavbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 pb-12 flex-1">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Applications</h1>
          <p className="text-muted-foreground">
            Track and manage all your job applications in one place
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Applications</SelectItem>
              <SelectItem value="drafts">Drafts</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="reviewing">Under Review</SelectItem>
              <SelectItem value="phone_screen">Phone Screen</SelectItem>
              <SelectItem value="technical_interview">Technical Interview</SelectItem>
              <SelectItem value="final_interview">Final Interview</SelectItem>
              <SelectItem value="interviewed">Interviewed</SelectItem>
              <SelectItem value="offer_extended">Offer Extended</SelectItem>
              <SelectItem value="offer_accepted">Offer Accepted</SelectItem>
              <SelectItem value="hired">Hired</SelectItem>
              <SelectItem value="rejected">Not Selected</SelectItem>
              <SelectItem value="offer_declined">Offer Declined</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No applications found</h2>
            <p className="text-muted-foreground mb-6">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your filters or search query"
                : "You haven't submitted any applications yet. Browse our open positions and apply!"}
            </p>
            {!searchQuery && statusFilter === "all" && (
              <Button asChild>
                <Link href="/careers">Browse Jobs</Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((app) => (
              <div
                key={app.id}
                className="group relative bg-background rounded-2xl p-6 md:p-8 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-0.5"
              >
                {/* Gradient Accent on Hover */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-secondary to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl"></div>
                
                <div className="flex flex-col gap-6">
                  {/* Job Info */}
                  <div className="flex items-start gap-4 md:gap-6">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-surface border border-border/50 flex items-center justify-center flex-shrink-0 group-hover:border-primary/30 transition-colors">
                      <Briefcase className="w-7 h-7 md:w-8 md:h-8 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl md:text-2xl font-semibold text-primary mb-2 group-hover:text-primary transition-colors line-clamp-2">
                            {app.job_postings?.title || "Unknown Position"}
                          </h3>
                          <p className="text-sm md:text-base text-secondary mb-3 font-light">
                            {app.job_postings?.department}
                            {app.job_postings?.location && ` • ${app.job_postings.location}`}
                            {app.job_postings?.employment_type && ` • ${app.job_postings.employment_type}`}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusColor(app.status, app.is_draft)}`}>
                            {getStatusIcon(app.status, app.is_draft)}
                            {getStatusLabel(app.status, app.is_draft)}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 md:gap-6 text-sm text-secondary">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-secondary/60" />
                          <span className="font-light">Applied {format(new Date(app.created_at), "MMM dd, yyyy")}</span>
                        </div>
                        {app.updated_at !== app.created_at && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-secondary/60" />
                            <span className="font-light">Updated {format(new Date(app.updated_at), "MMM dd, yyyy")}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions - Bottom Right */}
                  <div className="flex justify-end">
                    {app.is_draft ? (
                      <Button asChild size="sm" className="w-full sm:w-auto">
                        <Link href={`/careers/${app.job_posting_id}/apply`}>
                          Continue Application
                        </Link>
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full sm:w-auto border-border hover:border-primary hover:bg-primary/5"
                        onClick={() => {
                          // Store in sessionStorage temporarily for auto-fill (cleared after use)
                          sessionStorage.setItem('track_application_id', app.id);
                          sessionStorage.setItem('track_application_email', app.email);
                          // Navigate to track page without query parameters (replace to avoid history)
                          router.replace('/careers/track');
                        }}
                      >
                        View Status
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-auto">
        <CareersFooter />
      </div>
    </div>
  );
}
