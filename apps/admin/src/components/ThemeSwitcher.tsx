"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ThemeSwitcherProps {
  className?: string;
  iconClassName?: string;
  showLabel?: boolean;
  variant?: "default" | "compact";
}

export function ThemeSwitcher({ 
  className, 
  iconClassName,
  showLabel = true,
  variant = "default"
}: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    if (!mounted) return;
    
    // Simple toggle: if current theme is dark, switch to light, otherwise switch to dark
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  if (!mounted) {
    // Show placeholder while mounting to avoid hydration mismatch
    return (
      <button
        type="button"
        className={cn(
          "flex items-center justify-center gap-1.5 w-full rounded-lg border border-border/60 bg-card/70 px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors",
          variant === "compact" && "w-8 h-8 px-0",
          className
        )}
        aria-label="Toggle theme"
        disabled
      >
        <Moon size={16} className={cn(iconClassName, variant === "compact" && "w-4 h-4")} />
        {showLabel && variant !== "compact" && (
          <span className="group-data-[collapsible=icon]:hidden">Theme</span>
        )}
      </button>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "flex items-center justify-center gap-1.5 w-full rounded-lg border border-border/60 bg-card/70 px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-card transition-colors cursor-pointer",
        variant === "compact" && "w-8 h-8 px-0",
        className
      )}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {isDark ? (
        <Sun size={16} className={cn(iconClassName, variant === "compact" && "w-4 h-4")} />
      ) : (
        <Moon size={16} className={cn(iconClassName, variant === "compact" && "w-4 h-4")} />
      )}
      {showLabel && variant !== "compact" && (
        <span className="group-data-[collapsible=icon]:hidden">Theme</span>
      )}
    </button>
  );
}
