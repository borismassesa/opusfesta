"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { UserType } from "@/lib/auth";

interface OAuthUserTypeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (userType: UserType) => void;
  provider: "google" | "apple";
}

export function OAuthUserTypeSelector({
  open,
  onOpenChange,
  onSelect,
  provider,
}: OAuthUserTypeSelectorProps) {
  const [selectedType, setSelectedType] = useState<UserType>("couple");

  if (!open) {
    return null;
  }

  const handleSelect = () => {
    // Store selection in sessionStorage for callback handling
    if (typeof window !== "undefined") {
      sessionStorage.setItem("oauth_user_type", selectedType);
    }
    onSelect(selectedType);
    onOpenChange(false);
  };

  const providerName = provider === "google" ? "Google" : "Apple";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 bg-background border border-border rounded-2xl shadow-xl p-6">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold text-primary">
              Select Account Type
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Choose how you want to use OpusFesta with {providerName}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSelectedType("couple")}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedType === "couple"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="text-left">
                <div className="font-medium text-primary mb-1">I'm a Couple</div>
                <div className="text-xs text-muted-foreground">
                  Planning my wedding
                </div>
              </div>
            </button>

            <button
              onClick={() => setSelectedType("vendor")}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedType === "vendor"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="text-left">
                <div className="font-medium text-primary mb-1">I'm a Vendor</div>
                <div className="text-xs text-muted-foreground">
                  Providing services
                </div>
              </div>
            </button>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => onOpenChange(false)}
              className="flex-1 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSelect}
              className="flex-1 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Continue with {providerName}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
