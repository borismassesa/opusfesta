import { Suspense } from "react";
import { ResetPasswordForm } from "./ResetPasswordForm";

export const dynamic = 'force-dynamic';

export default function ResetPassword() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
