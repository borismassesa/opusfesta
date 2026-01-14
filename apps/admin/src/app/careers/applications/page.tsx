"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, Download, Search, Mail, Phone, FileText, ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { BulkActions } from "@/components/careers/BulkActions";
import { ExportDialog } from "@/components/careers/ExportDialog";
import { exportApplicationsToCSV } from "@/lib/careers/export";
import { CareersSidebar } from "@/components/careers/CareersSidebar";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabaseClient";
import { getAdminApiUrl } from "@/lib/api";
import Link from "next/link";

interface JobApplication {
  id: string;
  job_posting_id: string;
  full_name: string;
  email: string;
  phone: string;
  resume_url: string | null;
  cover_letter: string | null;
  cover_letter_url: string | null;
  portfolio_url: string | null;
  linkedin_url: string | null;
  experience: string | null;
  education: string | null;
  reference_info: string | null;
  status:
    | "pending"
    | "reviewing"
    | "phone_screen"
    | "technical_interview"
    | "final_interview"
    | "interviewed"
    | "offer_extended"
    | "offer_accepted"
    | "offer_declined"
    | "rejected"
    | "hired";
  notes: string | null;
  created_at: string;
  updated_at: string;
  job_postings: {
    id: string;
    title: string;
    department: string;
  } | null;
}

export default function ApplicationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [jobFilter, setJobFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const isFetchingRef = useRef(false);

  // Initialize filters from URL params
  useEffect(() => {
    const jobPostingId = searchParams?.get("jobPostingId");
    if (jobPostingId) {
      setJobFilter(jobPostingId);
    }
  }, [searchParams]);

  // Fetch applications only when filters change (no auto-refresh)
  useEffect(() => {
    if (!isFetchingRef.current) {
      fetchApplications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, jobFilter]);

  const fetchApplications = async () => {
    // Prevent duplicate fetches
    if (isFetchingRef.current) {
      return;
    }
    isFetchingRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      // Use absolute URL with basePath to call admin app's own API
      let url = `/api/admin/careers/applications`;

      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      if (jobFilter !== "all") {
        params.append("jobPostingId", jobFilter);
      }
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      let response: Response;
      try {
        response = await fetch(getAdminApiUrl(url), {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === "AbortError") {
          throw new Error("Request timed out. Please check your connection and try again.");
        }
        throw fetchError;
      }

      if (!response.ok) {
        let errorData: any = {};
        try {
          const text = await response.text();
          if (text) {
            errorData = JSON.parse(text);
          }
        } catch {
          // If response is not JSON, use status text
          errorData = { error: response.statusText || `HTTP ${response.status}` };
        }
        const errorMsg = errorData.error || `Failed to fetch applications: ${response.status} ${response.statusText}`;
        throw new Error(errorMsg);
      }

      const data = await response.json();
      setApplications(data.applications || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching applications:", err);
      let errorMessage = "Failed to load applications";
      if (err instanceof Error) {
        if (err.name === "AbortError" || err.message.includes("timeout")) {
          errorMessage = "Request timed out. Please check your connection and try again.";
        } else if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
          errorMessage = "Unable to connect to the server. Please check your connection.";
        } else if (err.message.includes("Unauthorized") || err.message.includes("401")) {
          errorMessage = "You are not authorized to view applications. Please log in as an admin.";
        } else if (err.message.includes("500") || err.message.includes("Internal server")) {
          errorMessage = "Server error occurred. Please try again later.";
        } else {
          errorMessage = err.message;
        }
      }
      setError(errorMessage);
      setApplications([]);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  // Get unique job postings for filter
  const jobPostings = useMemo(() => {
    const jobs = new Map();
    applications.forEach((app) => {
      if (app.job_postings) {
        jobs.set(app.job_postings.id, app.job_postings);
      }
    });
    return Array.from(jobs.values());
  }, [applications]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = applications.length;
    const pending = applications.filter((a) => a.status === "pending").length;
    const reviewing = applications.filter((a) => a.status === "reviewing").length;
    const phone_screen = applications.filter((a) => a.status === "phone_screen").length;
    const technical_interview = applications.filter((a) => a.status === "technical_interview").length;
    const final_interview = applications.filter((a) => a.status === "final_interview").length;
    const interviewed = applications.filter((a) => a.status === "interviewed").length;
    const offer_extended = applications.filter((a) => a.status === "offer_extended").length;
    const offer_accepted = applications.filter((a) => a.status === "offer_accepted").length;
    const offer_declined = applications.filter((a) => a.status === "offer_declined").length;
    const hired = applications.filter((a) => a.status === "hired").length;
    const rejected = applications.filter((a) => a.status === "rejected").length;
    return {
      total,
      pending,
      reviewing,
      phone_screen,
      technical_interview,
      final_interview,
      interviewed,
      offer_extended,
      offer_accepted,
      offer_declined,
      hired,
      rejected,
    };
  }, [applications]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      reviewing: "default",
      phone_screen: "default",
      technical_interview: "default",
      final_interview: "default",
      interviewed: "default",
      offer_extended: "default",
      offer_accepted: "default",
      offer_declined: "outline",
      rejected: "destructive",
      hired: "default",
    };
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-300",
      reviewing: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-300",
      phone_screen: "bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-900/20 dark:text-cyan-300",
      technical_interview: "bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/20 dark:text-indigo-300",
      final_interview: "bg-violet-100 text-violet-800 border-violet-300 dark:bg-violet-900/20 dark:text-violet-300",
      interviewed: "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/20 dark:text-purple-300",
      offer_extended: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/20 dark:text-emerald-300",
      offer_accepted: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-300",
      offer_declined: "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/20 dark:text-orange-300",
      rejected: "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-300",
      hired: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-300",
    };
    const labels: Record<string, string> = {
      pending: "Pending",
      reviewing: "Reviewing",
      phone_screen: "Phone Screen",
      technical_interview: "Technical Interview",
      final_interview: "Final Interview",
      interviewed: "Interviewed",
      offer_extended: "Offer Extended",
      offer_accepted: "Offer Accepted",
      offer_declined: "Offer Declined",
      rejected: "Rejected",
      hired: "Hired",
    };
    return (
      <Badge variant={variants[status] || "secondary"} className={cn("font-medium", colors[status] || colors.pending)}>
        {labels[status] || status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ")}
      </Badge>
    );
  };

  // Filter and sort applications
  const filteredAndSortedApplications = useMemo(() => {
    let filtered = applications.filter((app) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !app.full_name.toLowerCase().includes(query) &&
          !app.email.toLowerCase().includes(query) &&
          !app.job_postings?.title.toLowerCase().includes(query) &&
          !app.job_postings?.department.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      // Status filter is handled by API
      // Job filter is handled by API

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      let aVal: any = a[sortBy as keyof JobApplication];
      let bVal: any = b[sortBy as keyof JobApplication];

      if (sortBy === "created_at" || sortBy === "updated_at") {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else if (sortBy === "full_name" || sortBy === "email") {
        aVal = aVal?.toLowerCase() || "";
        bVal = bVal?.toLowerCase() || "";
      } else if (sortBy === "status") {
        const statusOrder = [
          "pending",
          "reviewing",
          "phone_screen",
          "technical_interview",
          "final_interview",
          "interviewed",
          "offer_extended",
          "offer_accepted",
          "offer_declined",
          "hired",
          "rejected",
        ];
        aVal = statusOrder.indexOf(aVal) >= 0 ? statusOrder.indexOf(aVal) : 999;
        bVal = statusOrder.indexOf(bVal) >= 0 ? statusOrder.indexOf(bVal) : 999;
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [applications, searchQuery, sortBy, sortDirection]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("asc");
    }
  };

  const handleSelect = (id: string, selected: boolean) => {
    const newSelected = new Set(selectedIds);
    if (selected) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedIds(new Set(filteredAndSortedApplications.map((app) => app.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) {
      alert("Please select at least one application");
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedIds.size} application(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(getAdminApiUrl(`/api/admin/careers/applications/bulk`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action: "delete",
          applicationIds: Array.from(selectedIds),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete applications");
      }

      setSelectedIds(new Set());
      fetchApplications();
    } catch (err) {
      console.error("Error bulk deleting applications:", err);
      alert(err instanceof Error ? err.message : "Failed to delete applications");
    }
  };

  const handleBulkActivate = async () => {
    if (selectedIds.size === 0) {
      alert("Please select at least one application");
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(getAdminApiUrl(`/api/admin/careers/applications/bulk`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action: "activate",
          applicationIds: Array.from(selectedIds),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to activate applications");
      }

      setSelectedIds(new Set());
      fetchApplications();
    } catch (err) {
      console.error("Error bulk activating applications:", err);
      alert(err instanceof Error ? err.message : "Failed to activate applications");
    }
  };

  const handleBulkDeactivate = async () => {
    if (selectedIds.size === 0) {
      alert("Please select at least one application");
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(getAdminApiUrl(`/api/admin/careers/applications/bulk`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action: "deactivate",
          applicationIds: Array.from(selectedIds),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to deactivate applications");
      }

      setSelectedIds(new Set());
      fetchApplications();
    } catch (err) {
      console.error("Error bulk deactivating applications:", err);
      alert(err instanceof Error ? err.message : "Failed to deactivate applications");
    }
  };

  const SortableHeader = ({ field, children, className }: { field: string; children: React.ReactNode; className?: string }) => {
    const isSorted = sortBy === field;
    return (
      <TableHead className={className}>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 -ml-3 hover:bg-transparent font-medium"
          onClick={() => handleSort(field)}
        >
          {children}
          <ArrowUpDown
            className={cn(
              "ml-2 h-4 w-4",
              isSorted && "text-primary",
              isSorted && sortDirection === "desc" && "rotate-180"
            )}
          />
        </Button>
      </TableHead>
    );
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden bg-background relative w-full">
      <CareersSidebar />
      <main className="flex-1 min-w-0 overflow-auto bg-background">
        <div className="p-3 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Job Applications</h1>
          <p className="text-muted-foreground mt-1">
            Review and manage job applications
          </p>
        </div>
        <div className="flex gap-2">
          <ExportDialog
            type="applications"
            data={filteredAndSortedApplications.map((app) => ({
              id: app.id,
              full_name: app.full_name,
              email: app.email,
              phone: app.phone,
              job_title: app.job_postings?.title || "N/A",
              status: app.status,
              created_at: app.created_at,
            }))}
          />
          <Link href="/careers/jobs">
            <Button variant="outline">Back to Job Postings</Button>
          </Link>
        </div>
      </div>

      {error && (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="font-semibold text-destructive mb-1">Error Loading Applications</p>
                <p className="text-sm text-destructive/80">{error}</p>
                {error.includes("Unauthorized") && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Please make sure you are logged in as an admin user.
                  </p>
                )}
                {error.includes("connection") && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Check your internet connection and try again.
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setError(null);
                  fetchApplications();
                }}
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Reviewing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.reviewing}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Interviewed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.interviewed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Hired
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.hired}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or job title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="reviewing">Reviewing</SelectItem>
            <SelectItem value="phone_screen">Phone Screen</SelectItem>
            <SelectItem value="technical_interview">Technical Interview</SelectItem>
            <SelectItem value="final_interview">Final Interview</SelectItem>
            <SelectItem value="interviewed">Interviewed</SelectItem>
            <SelectItem value="offer_extended">Offer Extended</SelectItem>
            <SelectItem value="offer_accepted">Offer Accepted</SelectItem>
            <SelectItem value="offer_declined">Offer Declined</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="hired">Hired</SelectItem>
          </SelectContent>
        </Select>
        <Select value={jobFilter} onValueChange={setJobFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by job" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Jobs</SelectItem>
            {jobPostings.map((job) => (
              <SelectItem key={job.id} value={job.id}>
                {job.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Bulk Actions */}
      <BulkActions
        selectedCount={selectedIds.size}
        onDelete={handleBulkDelete}
        onActivate={handleBulkActivate}
        onDeactivate={handleBulkDeactivate}
        onExport={() => {
          const selected = filteredAndSortedApplications.filter((app) => selectedIds.has(app.id));
          if (selected.length === 0) {
            alert("Please select at least one application to export");
            return;
          }
          exportApplicationsToCSV(selected.map((app) => ({
            id: app.id,
            full_name: app.full_name,
            email: app.email,
            phone: app.phone,
            job_title: app.job_postings?.title || "N/A",
            status: app.status,
            created_at: app.created_at,
          })));
        }}
        onClearSelection={() => setSelectedIds(new Set())}
      />

      {/* Applications Table */}
      {filteredAndSortedApplications.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">No applications found</p>
            <p className="text-sm text-muted-foreground">
              {searchQuery || statusFilter !== "all" || jobFilter !== "all"
                ? "Try adjusting your filters"
                : "Applications will appear here once candidates apply"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          filteredAndSortedApplications.length > 0 &&
                          filteredAndSortedApplications.every((app) => selectedIds.has(app.id))
                        }
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <SortableHeader field="full_name">Applicant</SortableHeader>
                    <SortableHeader field="created_at" className="hidden md:table-cell">
                      Position
                    </SortableHeader>
                    <SortableHeader field="status">Status</SortableHeader>
                    <SortableHeader field="created_at" className="hidden lg:table-cell">
                      Applied
                    </SortableHeader>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedApplications.map((app) => (
                    <TableRow
                      key={app.id}
                      className={cn(
                        "hover:bg-muted/50",
                        selectedIds.has(app.id) && "bg-muted/50"
                      )}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(app.id)}
                          onCheckedChange={(checked) => handleSelect(app.id, checked === true)}
                          aria-label={`Select ${app.full_name}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="font-medium">{app.full_name}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <Mail className="w-3 h-3" />
                            {app.email}
                          </div>
                          {app.phone && (
                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                              <Phone className="w-3 h-3" />
                              {app.phone}
                            </div>
                          )}
                          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground md:hidden mt-1">
                            <span className="font-medium">{app.job_postings?.title || "N/A"}</span>
                            {app.job_postings?.department && (
                              <>
                                <span>•</span>
                                <span>{app.job_postings.department}</span>
                              </>
                            )}
                            <span>•</span>
                            <span>{new Date(app.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div>
                          <div className="font-medium">{app.job_postings?.title || "N/A"}</div>
                          <div className="text-sm text-muted-foreground">
                            {app.job_postings?.department || ""}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(app.status)}</TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {new Date(app.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/careers/applications/${app.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <a href={`mailto:${app.email}`}>
                                <Mail className="h-4 w-4 mr-2" />
                                Send Email
                              </a>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </Card>
      )}
        </div>
      </main>
    </div>
  );
}
