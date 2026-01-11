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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  
  // Query database directly instead of HTTP fetch for better SSR reliability
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    const { data: job, error } = await supabaseAdmin
      .from("job_postings")
      .select("*")
      .eq("id", id)
      .eq("is_active", true)
      .single();
    
    if (!error && job) {
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
