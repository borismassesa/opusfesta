"use client";

import { Heart } from "lucide-react";
import { useSaveVendor } from "@/hooks/useSaveVendor";
import { cn } from "@/lib/utils";

interface VendorSaveButtonProps {
  vendorId: string;
  initialIsSaved?: boolean;
  className?: string;
  iconClassName?: string;
  variant?: "default" | "minimal";
}

export function VendorSaveButton({
  vendorId,
  initialIsSaved = false,
  className,
  iconClassName,
  variant = "default",
}: VendorSaveButtonProps) {
  const { isSaved, isLoading, toggleSave } = useSaveVendor({
    vendorId,
    redirectToLogin: true,
  });

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSave();
  };

  if (variant === "minimal") {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        className={cn(
          "p-1.5 rounded-full bg-background/90 backdrop-blur-sm hover:bg-background transition-colors",
          isLoading && "opacity-50 cursor-not-allowed",
          className
        )}
        aria-label={isSaved ? "Remove from saved" : "Save vendor"}
      >
        <Heart
          className={cn(
            "w-4 h-4",
            isSaved ? "text-red-500 fill-red-500" : "text-primary",
            iconClassName
          )}
        />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className={cn(
        "p-1.5 rounded-full bg-background/90 backdrop-blur-sm hover:bg-background transition-colors",
        isLoading && "opacity-50 cursor-not-allowed",
        className
      )}
      aria-label={isSaved ? "Remove from saved" : "Save vendor"}
    >
      <Heart
        className={cn(
          "w-4 h-4",
          isSaved ? "text-red-500 fill-red-500" : "text-primary",
          iconClassName
        )}
      />
    </button>
  );
}
