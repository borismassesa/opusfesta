"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit, ExternalLink, FileText, File, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { getAdminApiUrl } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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
  about_thefesta?: string | null;
  benefits?: string[] | null;
  growth_description?: string | null;
  hiring_process?: string[] | null;
  how_to_apply?: string | null;
  equal_opportunity_statement?: string | null;
  created_at: string;
  updated_at: string;
  application_count?: number;
}

export default function JobViewClient() {
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

      const response = await fetch(getAdminApiUrl(`/api/admin/careers/jobs?includeInactive=true`), {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch job posting");
      }

      const data = await response.json();
      const foundJob = data.jobs.find((j: JobPosting) => j.id === jobId);

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

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="space-y-4">
        <Link href="/careers/jobs">
          <Button variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Button>
        </Link>
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
          {error || "Job posting not found"}
        </div>
      </div>
    );
  }

  const handleExportPDF = async () => {
    try {
      const exportData: JobPostingForExport = {
        title: job.title,
        department: job.department,
        location: job.location,
        employment_type: job.employment_type,
        description: job.description,
        requirements: job.requirements || [],
        responsibilities: job.responsibilities || [],
        salary_range: job.salary_range || "",
        about_thefesta: job.about_thefesta || "",
        benefits: job.benefits || [],
        growth_description: job.growth_description || "",
        hiring_process: job.hiring_process || [],
        how_to_apply: job.how_to_apply || "",
        equal_opportunity_statement: job.equal_opportunity_statement || "",
      };
      await exportJobPostingToPDF(exportData);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("Failed to export PDF");
    }
  };

  const handleExportWord = async () => {
    try {
      const exportData: JobPostingForExport = {
        title: job.title,
        department: job.department,
        location: job.location,
        employment_type: job.employment_type,
        description: job.description,
        requirements: job.requirements || [],
        responsibilities: job.responsibilities || [],
        salary_range: job.salary_range || "",
        about_thefesta: job.about_thefesta || "",
        benefits: job.benefits || [],
        growth_description: job.growth_description || "",
        hiring_process: job.hiring_process || [],
        how_to_apply: job.how_to_apply || "",
        equal_opportunity_statement: job.equal_opportunity_statement || "",
      };
      await exportJobPostingToWord(exportData);
    } catch (error) {
      console.error("Error exporting Word:", error);
      alert("Failed to export Word document");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/careers/jobs">
          <Button variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Badge variant={job.is_active ? "default" : "secondary"}>
            {job.is_active ? "Active" : "Inactive"}
          </Badge>
          {job.application_count !== undefined && (
            <Badge variant="outline">
              {job.application_count} {job.application_count === 1 ? "Application" : "Applications"}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            <span>{job.department}</span>
            <span>•</span>
            <span>{job.location}</span>
            <span>•</span>
            <span>{job.employment_type}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/careers/jobs/${jobId}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>
          <a 
            href={`${process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3002'}/careers/${jobId}`} 
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              View on Website
            </Button>
          </a>
          <Button variant="outline" size="sm" onClick={handleExportPDF}>
            <FileText className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportWord}>
            <File className="w-4 h-4 mr-2" />
            Export Word
          </Button>
          <a 
            href={`${process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3002'}/careers/${jobId}/preview`} 
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
          </a>
        </div>
      </div>

      {/* Job Content */}
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-card sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/careers/jobs">
              <Button variant="ghost">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Jobs
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Badge variant={job.is_active ? "default" : "secondary"}>
                {job.is_active ? "Active" : "Inactive"}
              </Badge>
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
                href={`${process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3002'}/careers/${jobId}/preview`} 
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
              </a>
              <Link href={`/careers/jobs/${jobId}/edit`}>
                <Button size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </Link>
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

          {/* About OpusFesta */}
          {job.about_thefesta && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">About OpusFesta</h2>
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

          {/* Why You'll Love Working at OpusFesta */}
          {job.benefits && job.benefits.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Why You'll Love Working at OpusFesta</h2>
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

          {/* Growth at OpusFesta */}
          {job.growth_description && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Growth at OpusFesta</h2>
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

          {/* Metadata */}
          <div className="pt-8 border-t text-sm text-muted-foreground">
            <p>Created: {new Date(job.created_at).toLocaleDateString()}</p>
            <p>Last updated: {new Date(job.updated_at).toLocaleDateString()}</p>
            {job.application_count !== undefined && (
              <p>Applications: {job.application_count}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
