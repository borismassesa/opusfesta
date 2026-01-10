import { Suspense } from "react";
import { JobDescriptionClient } from "./JobDescriptionClient";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  
  // Try to fetch job for metadata
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3002'}/api/careers/jobs`, {
      cache: "no-store",
    });
    
    if (response.ok) {
      const data = await response.json();
      const job = data.jobs?.find((j: any) => j.id === id);
      
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
