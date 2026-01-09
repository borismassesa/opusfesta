"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, FileText, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { getAdminApiUrl } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { exportJobPostingToPDF, exportJobPostingToWord, JobPostingForExport } from "@/lib/careers/export";

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
  // New template fields
  about_thefesta?: string | null;
  benefits?: string[] | null;
  growth_description?: string | null;
  hiring_process?: string[] | null;
  how_to_apply?: string | null;
  equal_opportunity_statement?: string | null;
}

export default function PreviewPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;
  const [job, setJob] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchJob();
  }, [jobId]);

  const fetchJob = async () => {
    setLoading(true);
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
        throw new Error("Failed to fetch job posting");
      }

      const data = await response.json();
      const foundJob = data.jobs.find((j: any) => j.id === jobId);

      if (!foundJob) {
        throw new Error("Job posting not found");
      }

      setJob(foundJob);
    } catch (err: any) {
      console.error("Error fetching job:", err);
      setError(err.message || "Failed to load job posting");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (!job) return;
    exportJobPostingToPDF(job as JobPostingForExport);
  };

  const handleExportWord = () => {
    if (!job) return;
    exportJobPostingToWord(job as JobPostingForExport);
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Error</h1>
          <p className="text-muted-foreground mb-4">{error || "Job posting not found"}</p>
          <Link href="/careers/jobs">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Job Postings
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href={`/careers/jobs/${jobId}`}>
            <Button variant="ghost">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to View
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Preview Mode</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
            >
              <FileText className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportWord}
            >
              <File className="w-4 h-4 mr-2" />
              Export Word
            </Button>
            <a 
              href={`${process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3002'}/careers/${jobId}/apply`} 
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                View on Website
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Job Content */}
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">{job.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
              <span>{job.department}</span>
              <span>•</span>
              <span>{job.location}</span>
              <span>•</span>
              <span>{job.employment_type}</span>
              {job.salary_range && (
                <>
                  <span>•</span>
                  <span className="font-semibold text-foreground">{job.salary_range}</span>
                </>
              )}
            </div>
          </div>

          {!job.is_active && (
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                This job posting is currently inactive and not visible to applicants.
              </p>
            </div>
          )}
        </div>

        {/* About TheFesta */}
        {job.about_thefesta && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">About TheFesta</h2>
            <div 
              className="prose prose-lg max-w-none text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: job.about_thefesta }}
            />
          </div>
        )}

        {/* The Role */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">The Role</h2>
          <div 
            className="prose prose-lg max-w-none text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: job.description }}
          />
        </div>

        {/* What You'll Do */}
        {job.responsibilities && job.responsibilities.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">What You'll Do</h2>
            <ul className="space-y-2 list-disc list-inside">
              {job.responsibilities.map((resp, index) => (
                <li key={index} className="text-muted-foreground">
                  {resp}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* What We're Looking For */}
        {job.requirements && job.requirements.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">What We're Looking For</h2>
            <ul className="space-y-2 list-disc list-inside">
              {job.requirements.map((req, index) => (
                <li key={index} className="text-muted-foreground">
                  {req}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Why You'll Love Working at TheFesta */}
        {job.benefits && job.benefits.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Why You'll Love Working at TheFesta</h2>
            <ul className="space-y-2 list-disc list-inside">
              {job.benefits.map((benefit, index) => (
                <li key={index} className="text-muted-foreground">
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Work Arrangement */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Work Arrangement</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li>Location: <span className="font-semibold text-foreground">{job.location}</span></li>
            <li>Employment Type: <span className="font-semibold text-foreground">{job.employment_type}</span></li>
          </ul>
        </div>

        {/* Growth at TheFesta */}
        {job.growth_description && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Growth at TheFesta</h2>
            <div 
              className="prose prose-lg max-w-none text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: job.growth_description }}
            />
          </div>
        )}

        {/* Our Hiring Process */}
        {job.hiring_process && job.hiring_process.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Our Hiring Process</h2>
            <ol className="space-y-2 list-decimal list-inside">
              {job.hiring_process.map((step, index) => (
                <li key={index} className="text-muted-foreground">
                  {step}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* How to Apply */}
        {job.how_to_apply && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">How to Apply</h2>
            <div 
              className="prose prose-lg max-w-none text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: job.how_to_apply }}
            />
          </div>
        )}

        {/* Equal Opportunity Statement */}
        {job.equal_opportunity_statement && (
          <div className="pt-6 border-t space-y-4">
            <h2 className="text-xl font-bold">Equal Opportunity Statement</h2>
            <div 
              className="prose prose-sm max-w-none text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: job.equal_opportunity_statement }}
            />
          </div>
        )}

        {/* Apply Button */}
        <div className="pt-8 border-t">
          <a 
            href={`${process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3002'}/careers/${jobId}/apply`} 
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="lg" className="w-full md:w-auto">
              Apply Now
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
