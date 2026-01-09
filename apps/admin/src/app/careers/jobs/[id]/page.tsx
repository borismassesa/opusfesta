import type { Metadata } from "next";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getJobPostingMetadata } from "@/lib/metadata";
import JobViewClient from "./JobViewClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data: jobs } = await supabaseAdmin
      .from("job_postings")
      .select("title, department, location, description")
      .eq("id", id)
      .single();
    
    if (jobs) {
      return getJobPostingMetadata(jobs);
    }
  } catch (error) {
    console.error("Error generating metadata:", error);
  }
  
  return {
    title: "Job Posting",
    description: "View job posting details",
  };
}

export default function JobPostingViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <JobViewClient />;
}
