"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
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
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (!session || sessionError) {
        router.push(`/login?next=${encodeURIComponent('/careers/my-applications')}`);
        return;
      }

      const url = statusFilter === "all" 
        ? "/api/careers/applications/my-applications?includeDrafts=true"
        : `/api/careers/applications/my-applications?status=${statusFilter}&includeDrafts=true`;
      
      const response = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
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
      return <FileText className="w-4 h-4 text-blue-600" />;
    }
    switch (status) {
      case 'hired':
      case 'offer_accepted':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'pending':
      case 'reviewing':
      case 'phone_screen':
      case 'technical_interview':
      case 'final_interview':
      case 'offer_extended':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'rejected':
      case 'offer_declined':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string, isDraft: boolean) => {
    if (isDraft) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    }
    switch (status) {
      case 'hired':
      case 'offer_accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending':
      case 'reviewing':
      case 'phone_screen':
      case 'technical_interview':
      case 'final_interview':
      case 'offer_extended':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400';
      case 'rejected':
      case 'offer_declined':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
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
    <div className="min-h-screen bg-background">
      <CareersNavbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
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
                className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  {/* Left: Job Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Briefcase className="w-8 h-8 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-foreground">
                            {app.job_postings?.title || "Unknown Position"}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(app.status, app.is_draft)}`}>
                            {getStatusIcon(app.status, app.is_draft)}
                            {getStatusLabel(app.status, app.is_draft)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {app.job_postings?.department}
                          {app.job_postings?.location && ` • ${app.job_postings.location}`}
                          {app.job_postings?.employment_type && ` • ${app.job_postings.employment_type}`}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>Applied {format(new Date(app.created_at), "MMM dd, yyyy")}</span>
                          </div>
                          {app.updated_at !== app.created_at && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>Updated {format(new Date(app.updated_at), "MMM dd, yyyy")}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-col gap-2 sm:items-end">
                    {app.is_draft ? (
                      <Button asChild size="sm">
                        <Link href={`/careers/${app.job_posting_id}/apply`}>
                          Continue Application
                        </Link>
                      </Button>
                    ) : (
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/careers/track?id=${app.id}&email=${encodeURIComponent(app.email)}`}>
                          View Status
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CareersFooter />
    </div>
  );
}
