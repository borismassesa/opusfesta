"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";

export default function AuthError() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for error in URL parameters
    const error = searchParams.get("error");
    const errorCode = searchParams.get("error_code");
    const errorMsg = searchParams.get("msg");
    
    if (error || errorCode || errorMsg) {
      const isProviderNotEnabled = 
        errorMsg?.toLowerCase().includes("not enabled") ||
        errorMsg?.toLowerCase().includes("unsupported provider") ||
        errorCode === "validation_failed";
      
      const message = isProviderNotEnabled
        ? "OAuth provider (Google/Apple) is not enabled in your Supabase project. Please enable it in the Supabase Dashboard under Authentication → Providers, or use email/password to sign in."
        : errorMsg || "OAuth authentication failed. Please try again.";
      
      toast({
        variant: "destructive",
        title: isProviderNotEnabled ? "OAuth Provider Not Enabled" : "Authentication Failed",
        description: message,
      });
      
      // Redirect to login after showing toast
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } else {
      // No error params, redirect immediately
      router.push("/login");
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center">
      <div className="text-center space-y-4 max-w-md px-4">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
        <h1 className="text-2xl font-semibold">Authentication Error</h1>
        <p className="text-muted-foreground">
          Redirecting you to the login page...
        </p>
        <Link
          href="/login"
          className="inline-flex items-center text-sm font-medium text-primary hover:underline underline-offset-4 transition-colors"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Go to login page
        </Link>
      </div>
    </div>
  );
}
