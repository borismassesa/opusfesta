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

export async function fetchJobPostings(): Promise<JobPosting[]> {
  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // Use absolute URL if available, otherwise relative
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const apiUrl = `${baseUrl}/api/careers/jobs`;

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    try {
      const response = await fetch(apiUrl, {
        cache: "no-store",
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        console.error("API response error:", response.status, errorText);
        throw new Error(`Failed to fetch job postings: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.jobs) {
        console.warn("No jobs array in response:", data);
        return [];
      }
      
      return data.jobs || [];
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === "AbortError") {
        console.error("Request timed out");
        throw new Error("Request timed out. Please try again.");
      }
      throw fetchError;
    }
  } catch (error: any) {
    console.error("Error fetching job postings:", error);
    // Return empty array so UI can show "no positions found" instead of infinite loading
    return [];
  }
}
