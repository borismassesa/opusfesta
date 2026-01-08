"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, LayoutGrid, Table2, Briefcase, MapPin, DollarSign, Edit, Trash2, Eye, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { getAdminApiUrl } from "@/lib/api";
import Link from "next/link";
import { JobPostingTable } from "@/components/careers/JobPostingTable";
import { BulkActions } from "@/components/careers/BulkActions";
import { FiltersPanel } from "@/components/careers/FiltersPanel";
import { ExportDialog } from "@/components/careers/ExportDialog";
import { exportJobsToCSV } from "@/lib/careers/export";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CareersSidebar } from "@/components/careers/CareersSidebar";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  employment_type: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  salary_range: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  image_url?: string | null;
  featured_image_url?: string | null;
  application_count?: number;
}

export default function CareersPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      // Use absolute URL with basePath to call admin app's own API
      const response = await fetch(getAdminApiUrl(`/api/admin/careers/jobs?includeInactive=true`), {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch job postings");
      }

      const data = await response.json();
      setJobs(data.jobs || []);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError(err instanceof Error ? err.message : "Failed to load job postings");
    } finally {
      setLoading(false);
    }
  };

  // Get unique departments and locations
  const departments = useMemo(() => {
    const depts = new Set(jobs.map((job) => job.department));
    return Array.from(depts).sort();
  }, [jobs]);

  const locations = useMemo(() => {
    const locs = new Set(jobs.map((job) => job.location));
    return Array.from(locs).sort();
  }, [jobs]);

  // Filter and sort jobs
  const filteredAndSortedJobs = useMemo(() => {
    let filtered = jobs.filter((job) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !job.title.toLowerCase().includes(query) &&
          !job.department.toLowerCase().includes(query) &&
          !job.location.toLowerCase().includes(query) &&
          !job.description.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      // Department filter
      if (departmentFilter !== "all" && job.department !== departmentFilter) {
        return false;
      }

      // Location filter
      if (locationFilter !== "all" && job.location !== locationFilter) {
        return false;
      }

      // Status filter
      if (statusFilter === "active" && !job.is_active) {
        return false;
      }
      if (statusFilter === "inactive" && job.is_active) {
        return false;
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      let aVal: any = a[sortBy as keyof JobPosting];
      let bVal: any = b[sortBy as keyof JobPosting];

      if (sortBy === "created_at" || sortBy === "updated_at") {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [jobs, searchQuery, departmentFilter, locationFilter, statusFilter, sortBy, sortDirection]);

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
      setSelectedIds(new Set(filteredAndSortedJobs.map((job) => job.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleDelete = async (id: string) => {
    setJobToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!jobToDelete) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Use absolute URL with basePath to call admin app's own API
      const response = await fetch(getAdminApiUrl(`/api/admin/careers/jobs?id=${jobToDelete}`), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete job posting");
      }

      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(jobToDelete);
        return newSet;
      });
      fetchJobs();
      setDeleteDialogOpen(false);
      setJobToDelete(null);
    } catch (err) {
      console.error("Error deleting job:", err);
      alert(err instanceof Error ? err.message : "Failed to delete job posting");
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} job posting(s)?`)) {
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Use absolute URL with basePath to call admin app's own API
      const response = await fetch(getAdminApiUrl(`/api/admin/careers/jobs/bulk`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action: "delete",
          jobIds: Array.from(selectedIds),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete job postings");
      }

      setSelectedIds(new Set());
      fetchJobs();
    } catch (err) {
      console.error("Error bulk deleting jobs:", err);
      alert(err instanceof Error ? err.message : "Failed to delete job postings");
    }
  };

  const handleBulkActivate = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Use absolute URL with basePath to call admin app's own API
      const response = await fetch(getAdminApiUrl(`/api/admin/careers/jobs/bulk`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action: "activate",
          jobIds: Array.from(selectedIds),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to activate job postings");
      }

      setSelectedIds(new Set());
      fetchJobs();
    } catch (err) {
      console.error("Error bulk activating jobs:", err);
      alert(err instanceof Error ? err.message : "Failed to activate job postings");
    }
  };

  const handleBulkDeactivate = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Use absolute URL with basePath to call admin app's own API
      const response = await fetch(getAdminApiUrl(`/api/admin/careers/jobs/bulk`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action: "deactivate",
          jobIds: Array.from(selectedIds),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to deactivate job postings");
      }

      setSelectedIds(new Set());
      fetchJobs();
    } catch (err) {
      console.error("Error bulk deactivating jobs:", err);
      alert(err instanceof Error ? err.message : "Failed to deactivate job postings");
    }
  };

  const handleBulkExport = () => {
    const selectedJobs = filteredAndSortedJobs.filter((job) => selectedIds.has(job.id));
    if (selectedJobs.length === 0) {
      alert("Please select at least one job posting to export");
      return;
    }
    // Export will be handled by ExportDialog component
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setDepartmentFilter("all");
    setLocationFilter("all");
    setStatusFilter("all");
  };

  const stats = useMemo(() => {
    const total = jobs.length;
    const active = jobs.filter((j) => j.is_active).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [jobs]);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-background relative w-full">
      <CareersSidebar />
      <main className="flex-1 min-w-0 overflow-auto bg-background">
        <div className="p-3 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Job Postings</h1>
          <p className="text-muted-foreground mt-1">Manage job postings and applications</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-1 border rounded-lg p-1">
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="h-8"
            >
              <Table2 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="h-8"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
          <Link href="/careers/applications">
            <Button variant="outline">View Applications</Button>
          </Link>
          <ExportDialog
            type="jobs"
            data={filteredAndSortedJobs}
            trigger={
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            }
          />
          <Link href="/careers/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Job Posting
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Inactive
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">{stats.inactive}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <FiltersPanel
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        departmentFilter={departmentFilter}
        onDepartmentChange={setDepartmentFilter}
        locationFilter={locationFilter}
        onLocationChange={setLocationFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        departments={departments}
        locations={locations}
        onClearFilters={handleClearFilters}
      />

      {/* Bulk Actions */}
      <BulkActions
        selectedCount={selectedIds.size}
        onDelete={handleBulkDelete}
        onActivate={handleBulkActivate}
        onDeactivate={handleBulkDeactivate}
        onExport={() => {
          const selectedJobs = filteredAndSortedJobs.filter((job) => selectedIds.has(job.id));
          if (selectedJobs.length === 0) {
            alert("Please select at least one job posting to export");
            return;
          }
          exportJobsToCSV(selectedJobs);
        }}
        onClearSelection={() => setSelectedIds(new Set())}
      />

      {/* Jobs List */}
      {viewMode === "table" ? (
        <JobPostingTable
          jobs={filteredAndSortedJobs}
          selectedIds={selectedIds}
          onSelect={handleSelect}
          onSelectAll={handleSelectAll}
          onDelete={handleDelete}
          onEdit={(id) => router.push(`/careers/${id}`)}
          onPreview={(id) => router.push(`/careers/${id}/preview`)}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedJobs.length === 0 ? (
            <div className="col-span-full text-center py-12 border rounded-lg">
              <p className="text-muted-foreground mb-4">No job postings found.</p>
              <Link href="/careers/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Job Posting
                </Button>
              </Link>
            </div>
          ) : (
            filteredAndSortedJobs.map((job) => (
              <Card
                key={job.id}
                className={`hover:shadow-lg transition-shadow ${!job.is_active ? "opacity-60" : ""}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{job.title}</CardTitle>
                    {!job.is_active && (
                      <span className="text-xs bg-muted px-2 py-1 rounded">Inactive</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      {job.department}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {job.location}
                    </span>
                    {job.salary_range && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {job.salary_range}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                  <div className="flex gap-2 pt-4 border-t">
                    <Link href={`/careers/${job.id}`} className="flex-1">
                      <Button variant="outline" className="w-full" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(job.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Job Posting</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this job posting? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </div>
      </main>
    </div>
  );
}
