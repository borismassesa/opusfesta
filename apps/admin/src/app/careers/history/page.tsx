"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { LayoutGrid, Table2, Briefcase, MapPin, DollarSign, Edit, Eye, ArchiveRestore, Copy, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { getAdminApiUrl } from "@/lib/api";
import Link from "next/link";
import { JobPostingTable } from "@/components/careers/JobPostingTable";
import { FiltersPanel } from "@/components/careers/FiltersPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CareersSidebar } from "@/components/careers/CareersSidebar";
import { cn } from "@/lib/utils";

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
  is_archived?: boolean;
  created_at: string;
  updated_at: string;
  image_url?: string | null;
  featured_image_url?: string | null;
  application_count?: number;
}

export default function HistoryPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");

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

      // Fetch all jobs including archived
      const response = await fetch(getAdminApiUrl(`/api/admin/careers/jobs?includeInactive=true&includeArchived=true`), {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch archived job postings");
      }

      const data = await response.json();
      // Filter to only show archived jobs
      const archivedJobs = (data.jobs || []).filter((job: JobPosting) => job.is_archived);
      setJobs(archivedJobs);
    } catch (err) {
      console.error("Error fetching archived jobs:", err);
      setError(err instanceof Error ? err.message : "Failed to load archived job postings");
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
      // Only show archived jobs
      if (!job.is_archived) {
        return false;
      }

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
  }, [jobs, searchQuery, departmentFilter, locationFilter, sortBy, sortDirection]);

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

  const handleUnarchive = async (ids?: string[]) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const jobIds = ids || Array.from(selectedIds);
      
      if (jobIds.length === 0) {
        alert("Please select at least one job posting to unarchive");
        return;
      }

      const response = await fetch(getAdminApiUrl(`/api/admin/careers/jobs/bulk`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action: "unarchive",
          jobIds: jobIds,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || "Failed to unarchive job postings");
      }

      setSelectedIds(new Set());
      fetchJobs();
    } catch (err) {
      console.error("Error unarchiving jobs:", err);
      alert(err instanceof Error ? err.message : "Failed to unarchive job postings");
    }
  };

  const handleReuse = async (job: JobPosting) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Create a new active job based on the archived one
      const newJob = {
        title: job.title,
        department: job.department,
        location: job.location,
        employment_type: job.employment_type,
        description: job.description,
        requirements: job.requirements,
        responsibilities: job.responsibilities,
        salary_range: job.salary_range,
        is_active: true, // Create as active so it can be used immediately
        about_thefesta: (job as any).about_thefesta,
        benefits: (job as any).benefits || [],
        growth_description: (job as any).growth_description,
        hiring_process: (job as any).hiring_process || [],
        how_to_apply: (job as any).how_to_apply,
        equal_opportunity_statement: (job as any).equal_opportunity_statement,
      };

      const response = await fetch(getAdminApiUrl(`/api/admin/careers/jobs`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(newJob),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || "Failed to reuse job posting");
      }

      const data = await response.json();
      // Navigate to the new job's edit page so user can review/modify before publishing
      router.push(`/careers/jobs/${data.job.id}/edit`);
    } catch (err) {
      console.error("Error reusing job:", err);
      alert(err instanceof Error ? err.message : "Failed to reuse job posting");
    }
  };

  const handleDuplicate = async (job: JobPosting) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Create a new job based on the archived one (as inactive for review)
      const newJob = {
        title: `${job.title} (Copy)`,
        department: job.department,
        location: job.location,
        employment_type: job.employment_type,
        description: job.description,
        requirements: job.requirements,
        responsibilities: job.responsibilities,
        salary_range: job.salary_range,
        is_active: false, // Start as inactive so user can review before publishing
        about_thefesta: (job as any).about_thefesta,
        benefits: (job as any).benefits || [],
        growth_description: (job as any).growth_description,
        hiring_process: (job as any).hiring_process || [],
        how_to_apply: (job as any).how_to_apply,
        equal_opportunity_statement: (job as any).equal_opportunity_statement,
      };

      const response = await fetch(getAdminApiUrl(`/api/admin/careers/jobs`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(newJob),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || "Failed to duplicate job posting");
      }

      const data = await response.json();
      router.push(`/careers/jobs/${data.job.id}/edit`);
    } catch (err) {
      console.error("Error duplicating job:", err);
      alert(err instanceof Error ? err.message : "Failed to duplicate job posting");
    }
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setDepartmentFilter("all");
    setLocationFilter("all");
  };

  const stats = useMemo(() => {
    const total = jobs.length;
    return { total };
  }, [jobs]);

  if (loading) {
    return (
      <div className="flex h-full overflow-hidden bg-background relative w-full">
        <CareersSidebar />
        <main className="flex-1 min-w-0 overflow-auto bg-background">
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-10 w-32" />
            </div>
            <Skeleton className="h-24" />
            <Skeleton className="h-96" />
          </div>
        </main>
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
              <h1 className="text-3xl font-bold">Archived Job Postings</h1>
              <p className="text-muted-foreground mt-1">View and manage archived job postings for future reference</p>
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
              {selectedIds.size > 0 && (
                <Button
                  variant="outline"
                  onClick={() => handleUnarchive()}
                >
                  <ArchiveRestore className="w-4 h-4 mr-2" />
                  Unarchive Selected ({selectedIds.size})
                </Button>
              )}
            </div>
          </div>

          {error && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
              {error}
            </div>
          )}

          {/* Stats Card */}
          <div className="grid gap-4 md:grid-cols-1">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Archived Jobs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.total}</div>
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
            statusFilter="archived"
            onStatusChange={() => {}}
            departments={departments}
            locations={locations}
            onClearFilters={handleClearFilters}
            hideStatusFilter={true}
          />

          {/* Jobs List */}
          {viewMode === "table" ? (
            <JobPostingTable
              jobs={filteredAndSortedJobs}
              selectedIds={selectedIds}
              onSelect={handleSelect}
              onSelectAll={handleSelectAll}
              onDelete={() => {}}
              onEdit={(id) => router.push(`/careers/jobs/${id}/edit`)}
              onPreview={(id) => router.push(`/careers/jobs/${id}/preview`)}
              onArchive={undefined}
              onUnarchive={(id) => handleUnarchive([id])}
              onReuse={(id) => {
                const job = filteredAndSortedJobs.find(j => j.id === id);
                if (job) handleReuse(job);
              }}
              sortBy={sortBy}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredAndSortedJobs.length === 0 ? (
                <div className="col-span-full text-center py-12 border rounded-lg">
                  <p className="text-muted-foreground mb-4">No archived job postings found.</p>
                  <p className="text-sm text-muted-foreground">
                    Archived jobs will appear here for future reference.
                  </p>
                </div>
              ) : (
                filteredAndSortedJobs.map((job) => (
                  <Card
                    key={job.id}
                    className="hover:shadow-lg transition-shadow opacity-60"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{job.title}</CardTitle>
                        <span className="text-xs bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 px-2 py-1 rounded">Archived</span>
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
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleReuse(job)}
                          className="flex-1"
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Reuse
                        </Button>
                        <Link href={`/careers/jobs/${job.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnarchive([job.id])}
                        >
                          <ArchiveRestore className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
