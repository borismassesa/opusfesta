"use client";

import { useRouter } from "next/navigation";
import { ShieldX, LogOut, ArrowLeft, Mail } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";

interface UnauthorizedPageProps {
  session?: any;
  userEmail?: string;
}

export function UnauthorizedPage({ session, userEmail }: UnauthorizedPageProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
            <ShieldX className="w-10 h-10 text-destructive" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Access Denied
          </h1>
          
          {session ? (
            <div className="space-y-3">
              <p className="text-muted-foreground">
                Your account does not have permission to access the admin portal.
              </p>
              {userEmail && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span>Logged in as: <strong className="text-foreground">{userEmail}</strong></span>
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                If you believe this is an error, please contact your administrator to request access.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-muted-foreground">
                You need to be logged in with an authorized admin account to access this portal.
              </p>
              <p className="text-sm text-muted-foreground">
                Only whitelisted admin emails are authorized to access the admin portal.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {session ? (
            <>
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="w-full sm:w-auto"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
              <Button
                onClick={() => router.push("/login")}
                className="w-full sm:w-auto"
              >
                Try Different Account
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => router.push("/login")}
                className="w-full sm:w-auto"
              >
                Go to Login
              </Button>
              <Button
                onClick={() => router.push("/")}
                variant="outline"
                className="w-full sm:w-auto"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </>
          )}
        </div>

        {/* Help Text */}
        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Need help? Contact your system administrator or check the admin whitelist configuration.
          </p>
        </div>
      </div>
    </div>
  );
}
