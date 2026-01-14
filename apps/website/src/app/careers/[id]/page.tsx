import { Suspense } from "react";
import { JobDescriptionClient } from "./JobDescriptionClient";
import { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// Get Supabase admin client for server-side queries
function getSupabaseAdmin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing Supabase configuration");
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

// Helper function to check if string is UUID
function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// Helper function to generate slug from title
function getJobSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  
  // Query database directly instead of HTTP fetch for better SSR reliability
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    let job;
    
    // Check if it's a UUID (backward compatibility) or a slug
    if (isUUID(id)) {
      // Query by ID
      const { data, error } = await supabaseAdmin
        .from("job_postings")
        .select("*")
        .eq("id", id)
        .eq("is_active", true)
        .single();
      
      if (!error && data) {
        job = data;
      }
    } else {
      // Query by slug (match slug generated from title)
      const { data: jobs, error } = await supabaseAdmin
        .from("job_postings")
        .select("*")
        .eq("is_active", true);
      
      if (!error && jobs) {
        job = jobs.find(j => getJobSlug(j.title) === id);
      }
    }
    
    if (job) {
      return {
        title: `${job.title} | Careers at OpusFesta`,
        description: job.description 
          ? job.description.replace(/<[^>]*>/g, '').substring(0, 160) + "..."
          : `Join OpusFesta as a ${job.title} in ${job.department}. ${job.location} - ${job.employment_type}`,
        openGraph: {
          title: `${job.title} | OpusFesta Careers`,
          description: `Apply for ${job.title} at OpusFesta. ${job.department} - ${job.location}`,
          type: "website",
        },
      };
    }
  } catch (error) {
    console.error("Error generating metadata:", error);
  }
  
  return {
    title: "Job Posting | Careers at OpusFesta",
    description: "View job posting details at OpusFesta",
  };
}

export default function JobDescriptionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="bg-background text-primary min-h-screen flex items-center justify-center">
          <div className="text-muted-foreground">Loading job details...</div>
        </div>
      }
    >
      <JobDescriptionClient params={params} />
    </Suspense>
  );
}
