import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

interface UseSaveVendorOptions {
  vendorId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  redirectToLogin?: boolean;
}

export function useSaveVendor({
  vendorId,
  onSuccess,
  onError,
  redirectToLogin = true,
}: UseSaveVendorOptions) {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const checkSavedStatus = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsSaved(false);
        return;
      }

      const response = await fetch(`/api/users/saved-vendors`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const saved = data.vendors?.some((v: any) => v.id === vendorId) || false;
        setIsSaved(saved);
      }
    } catch (error) {
      console.error("Failed to check saved status:", error);
    }
  }, [vendorId]);

  const toggleSave = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        if (redirectToLogin) {
          router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
        } else {
          onError?.("Please log in to save vendors");
        }
        return;
      }

      setIsLoading(true);
      
      // Optimistic update
      const previousState = isSaved;
      setIsSaved(!isSaved);

      const method = isSaved ? "DELETE" : "POST";
      const response = await fetch(`/api/vendors/${vendorId}/save`, {
        method,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        // Revert optimistic update on error
        setIsSaved(previousState);
        
        const errorData = await response.json().catch(() => ({ error: "Failed to save vendor" }));
        
        if (response.status === 401) {
          if (redirectToLogin) {
            router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
          } else {
            onError?.("Please log in to save vendors");
          }
        } else {
          onError?.(errorData.error || "Failed to save vendor");
        }
        return;
      }

      onSuccess?.();
    } catch (error) {
      // Revert optimistic update on error
      setIsSaved((prev) => !prev);
      console.error("Error toggling save:", error);
      onError?.("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [vendorId, isSaved, router, redirectToLogin, onSuccess, onError]);

  return {
    isSaved,
    isLoading,
    toggleSave,
    checkSavedStatus,
  };
}
