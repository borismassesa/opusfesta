export interface JobPosting {
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
  // New template fields
  about_thefesta?: string | null;
  benefits?: string[] | null;
  growth_description?: string | null;
  hiring_process?: string[] | null;
  how_to_apply?: string | null;
  equal_opportunity_statement?: string | null;
}

export async function fetchJobPostings(sessionToken?: string): Promise<JobPosting[]> {
  try {
    const headers: HeadersInit = {};
    if (sessionToken) {
      headers["Authorization"] = `Bearer ${sessionToken}`;
    }

    const response = await fetch("/api/careers/jobs", {
      cache: "no-store",
      headers,
    });

    if (!response.ok) {
      throw new Error("Failed to fetch job postings");
    }

    const data = await response.json();
    return data.jobs || [];
  } catch (error) {
    console.error("Error fetching job postings:", error);
    return [];
  }
}
