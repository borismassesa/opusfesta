import { supabase } from "@/lib/supabaseClient";

export interface JobApplication {
  id: string;
  job_posting_id: string;
  user_id?: string | null;
  full_name: string;
  email: string;
  phone: string;
  resume_url: string | null;
  cover_letter: string | null;
  cover_letter_url: string | null;
  portfolio_url: string | null;
  linkedin_url: string | null;
  experience: string | null;
  education: string | null;
  reference_info: string | null;
  status: "pending" | "reviewing" | "interviewed" | "rejected" | "hired" | "phone_screen" | "technical_interview" | "final_interview" | "offer_extended" | "offer_accepted" | "offer_declined";
  is_draft?: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Upload resume to Supabase Storage
export async function uploadResume(
  file: File
): Promise<{ url: string | null; error: string | null }> {
  try {
    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return {
        url: null,
        error: "Invalid file type. Please upload a PDF, DOC, or DOCX file.",
      };
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        url: null,
        error: "File size must be less than 5MB.",
      };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const fileExt = file.name.split(".").pop() || "pdf";
    const fileName = `resumes/${timestamp}-${randomStr}.${fileExt}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("careers")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Supabase storage upload error:", error);
      return {
        url: null,
        error: error.message || "Failed to upload resume",
      };
    }

    if (!data) {
      return { url: null, error: "Upload failed: No data returned" };
    }

    // Return the path - admins will generate signed URLs when needed
    // The path is stored in the database and can be used to generate signed URLs later
    return { url: data.path, error: null };
  } catch (error) {
    console.error("Unexpected upload error:", error);
    return {
      url: null,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

// Upload cover letter to Supabase Storage
export async function uploadCoverLetter(
  file: File
): Promise<{ url: string | null; error: string | null }> {
  try {
    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return {
        url: null,
        error: "Invalid file type. Please upload a PDF, DOC, or DOCX file.",
      };
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        url: null,
        error: "File size must be less than 5MB.",
      };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const fileExt = file.name.split(".").pop() || "pdf";
    const fileName = `cover-letters/${timestamp}-${randomStr}.${fileExt}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("careers")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Supabase storage upload error:", error);
      return {
        url: null,
        error: error.message || "Failed to upload cover letter",
      };
    }

    if (!data) {
      return { url: null, error: "Upload failed: No data returned" };
    }

    // Return the path - admins will generate signed URLs when needed
    return { url: data.path, error: null };
  } catch (error) {
    console.error("Unexpected upload error:", error);
    return {
      url: null,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
