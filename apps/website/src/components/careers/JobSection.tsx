"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Search, Briefcase, MapPin, Clock, X, Loader2, ArrowRight } from "lucide-react";
import { fetchJobPostings, JobPosting, getJobSlug } from "@/lib/careers/jobs";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const DEPARTMENTS = [
  "Engineering",
  "Marketing",
  "Sales",
  "Customer Success",
  "Product",
  "Design",
  "Operations",
];

// Removed emoji icons for cleaner design

// Skeleton loader component
function JobCardSkeleton() {
  return (
    <div className="bg-surface border border-border p-6 rounded-xl h-full min-h-[200px] animate-pulse">
      <div className="h-6 bg-border rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-border rounded w-1/2 mb-3"></div>
      <div className="flex gap-2 mb-4">
        <div className="h-6 bg-border rounded-full w-20"></div>
        <div className="h-6 bg-border rounded-full w-24"></div>
      </div>
      <div className="pt-4 border-t border-border">
        <div className="h-4 bg-border rounded w-1/3"></div>
      </div>
    </div>
  );
}

export function JobSection() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDept, setSelectedDept] = useState("All departments");
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;
    
    async function loadJobs() {
      try {
        setLoading(true);
        setError(null);
        
        // Add timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          if (isMounted) {
            console.error("Job fetch timeout - taking too long");
            setLoading(false);
            setJobs([]);
            setError("Loading is taking longer than expected. Please refresh the page.");
          }
        }, 10000); // 10 second timeout
        
        // Fetch jobs - descriptions are now PUBLIC, no authentication needed
        const jobPostings = await fetchJobPostings();
        
        // Clear timeout if successful
        clearTimeout(timeoutId);
        
        // Only update state if component is still mounted
        if (isMounted) {
          setJobs(jobPostings);
          setLoading(false);
        }
      } catch (err: any) {
        console.error("Error loading jobs:", err);
        clearTimeout(timeoutId);
        // Set empty array on error to show "no positions found" instead of infinite loading
        if (isMounted) {
          setJobs([]);
          setLoading(false);
          setError(err.message || "Failed to load job postings. Please try refreshing the page.");
        }
      }
    }
    
    loadJobs();
    
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []); // Fetch jobs on mount - no authentication needed

  // GSAP animations for job cards
  useEffect(() => {
    if (loading || !containerRef.current) return;

    const ctx = gsap.context(() => {
      const jobCards = gsap.utils.toArray<HTMLElement>(".job-card");
      
      if (jobCards.length > 0) {
        gsap.fromTo(jobCards,
          {
            y: 30,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.08,
            ease: "power2.out",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse"
            }
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [loading, jobs, selectedDept, searchQuery]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchDept =
        selectedDept === "All departments" || job.department === selectedDept;
      const matchSearch =
        searchQuery === "" ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (job.description && job.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchDept && matchSearch;
    });
  }, [jobs, selectedDept, searchQuery]);

  // Group jobs by department
  const groupedJobs = useMemo(() => {
    const groups: Record<string, JobPosting[]> = {};
    filteredJobs.forEach((job) => {
      if (!groups[job.department]) {
        groups[job.department] = [];
      }
      groups[job.department].push(job);
    });
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filteredJobs]);

  const formatSalary = (salaryRange: string | null) => {
    if (!salaryRange) return null;
    const match = salaryRange.match(/(\d+(?:,\d+)*)/g);
    if (match && match.length >= 2) {
      const min = parseInt(match[0].replace(/,/g, "")) / 1000000;
      const max = parseInt(match[1].replace(/,/g, "")) / 1000000;
      return `TZS ${min}M - ${max}M`;
    }
    return salaryRange;
  };

  const getJobPreview = (description: string) => {
    if (typeof window === 'undefined') {
      // Server-side: simple regex-based stripping
      let text = description
        .replace(/<[^>]*>/g, '') // Strip HTML tags
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .trim();
      return text.length > 120 ? text.substring(0, 120) + "..." : text;
    }
    
    // Client-side: use DOM to properly parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = description;
    let text = tempDiv.textContent || tempDiv.innerText || '';
    text = text.trim();
    return text.length > 120 ? text.substring(0, 120) + "..." : text;
  };

  const hasActiveFilters = selectedDept !== "All departments" || searchQuery !== "";

  const clearFilters = () => {
    setSelectedDept("All departments");
    setSearchQuery("");
  };

  if (loading) {
    return (
      <section className="careers-section px-6 lg:px-12 max-w-6xl mx-auto py-24 border-t border-primary/10">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-primary mb-3">
            Open Positions
          </h2>
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <p className="text-secondary text-base font-light">Loading positions...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="careers-section px-6 lg:px-12 max-w-6xl mx-auto py-24 border-t border-primary/10">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-primary mb-3">
            Open Positions
          </h2>
        </div>
        <div className="text-center py-24 bg-surface border border-border rounded-xl">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">⚠️</span>
            </div>
            <h3 className="text-xl font-semibold text-primary mb-3">
              Unable to Load Positions
            </h3>
            <p className="text-secondary mb-6 leading-relaxed font-light">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary border border-border rounded-full transition-colors hover:bg-primary/5"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={containerRef} className="careers-section px-6 lg:px-12 max-w-6xl mx-auto py-24 border-t border-primary/10">
      {/* Header */}
      <div className="mb-12">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-primary mb-4">
          Open Positions
        </h2>
      </div>

      {/* Clean Filters */}
      <div className="mb-12 space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" size={18} />
          <input
            type="text"
            placeholder="Search jobs by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface border border-border rounded-xl px-4 py-3.5 pl-11 pr-4 text-primary placeholder:text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 transition-all font-light"
          />
        </div>

        {/* Department Filter Pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedDept("All departments")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedDept === "All departments"
                ? "bg-primary text-primary-foreground"
                : "bg-surface text-secondary hover:text-primary border border-border"
            }`}
          >
            All
          </button>
          {DEPARTMENTS.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedDept === dept
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface text-secondary hover:text-primary border border-border"
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <div className="pt-2">
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-secondary hover:text-primary transition-colors"
            >
              <X size={14} />
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Job Lists */}
      {groupedJobs.length > 0 ? (
        <div className="space-y-12">
          {groupedJobs.map(([department, departmentJobs]) => (
            <div key={department}>
              <div className="flex items-center gap-3 mb-6">
                <h3 className="text-xl md:text-2xl font-semibold text-primary">{department}</h3>
                <div className="flex-1 h-px bg-border"></div>
                <span className="text-sm text-secondary font-light">{departmentJobs.length}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {departmentJobs.map((job) => {
                  const salaryPreview = formatSalary(job.salary_range);
                  return (
                    <div
                      key={job.id}
                      className="job-card bg-surface border border-border rounded-xl p-6 transition-all hover:border-primary/30 hover:shadow-sm"
                    >
                      <div className="mb-4">
                        <Link
                          href={`/careers/${getJobSlug(job.title)}`}
                          className="block group"
                        >
                          <h4 className="font-semibold text-lg text-primary group-hover:underline mb-3 leading-tight">
                            {job.title}
                          </h4>
                        </Link>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-secondary mb-3">
                          <span className="font-light">{job.department}</span>
                          <span className="text-border">·</span>
                          <div className="flex items-center gap-1">
                            <MapPin size={12} />
                            <span className="font-light">{job.location}</span>
                          </div>
                          <span className="text-border">·</span>
                          <span className="font-light">{job.employment_type}</span>
                        </div>
                      </div>

                      {salaryPreview && (
                        <div className="mb-4">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/5 text-primary text-xs font-medium rounded-full">
                            <Clock size={12} />
                            {salaryPreview}
                          </span>
                        </div>
                      )}

                      {job.description ? (
                        <p className="text-sm text-secondary mb-6 line-clamp-2 leading-relaxed font-light">
                          {getJobPreview(job.description)}
                        </p>
                      ) : (
                        <p className="text-sm text-secondary mb-6 line-clamp-2 leading-relaxed font-light">
                          Join our {job.department} team as a {job.title} in {job.location}.
                        </p>
                      )}

                      <div className="pt-4 border-t border-border flex justify-end">
                        <Link
                          href={`/careers/${getJobSlug(job.title)}`}
                          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-accent transition-colors group"
                        >
                          View details
                          <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-surface border border-border rounded-xl">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Briefcase className="w-8 h-8 text-primary opacity-50" />
            </div>
            <h3 className="text-xl font-semibold text-primary mb-3">
              No positions found
            </h3>
            <p className="text-secondary mb-6 leading-relaxed font-light">
              No positions match your current filters. Try adjusting your search criteria.
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-secondary hover:text-primary border border-border rounded-full transition-colors"
              >
                <X size={14} />
                Clear all filters
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
