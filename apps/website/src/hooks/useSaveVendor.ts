import { useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { useAuthGate } from "@/hooks/useAuthGate";

interface UseSaveVendorOptions {
  vendorId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function useSaveVendor({
  vendorId,
  onSuccess,
  onError,
}: UseSaveVendorOptions) {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { isSignedIn, getToken } = useAuth();
  const { requireAuth } = useAuthGate();

  const checkSavedStatus = useCallback(async () => {
    try {
      if (!isSignedIn) {
        setIsSaved(false);
        return;
      }

      const token = await getToken();
      const response = await fetch(`/api/users/saved-vendors`, {
        headers: {
          Authorization: `Bearer ${token}`,
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
  }, [vendorId, isSignedIn, getToken]);

  const performToggle = useCallback(async () => {
    setIsLoading(true);

    // Optimistic update
    const previousState = isSaved;
    setIsSaved(!isSaved);

    try {
      const token = await getToken();
      const method = isSaved ? "DELETE" : "POST";
      const response = await fetch(`/api/vendors/${vendorId}/save`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        // Revert optimistic update on error
        setIsSaved(previousState);

        const errorData = await response.json().catch(() => ({ error: "Failed to save vendor" }));
        onError?.(errorData.error || "Failed to save vendor");
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
  }, [vendorId, isSaved, onSuccess, onError, getToken]);

  const toggleSave = useCallback(() => {
    requireAuth("save", performToggle);
  }, [requireAuth, performToggle]);

  return {
    isSaved,
    isLoading,
    toggleSave,
    checkSavedStatus,
  };
}
