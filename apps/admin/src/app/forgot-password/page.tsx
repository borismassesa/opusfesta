import { Suspense } from "react";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export const dynamic = 'force-dynamic';

export default function ForgotPassword() {
  return (
    <Suspense fallback={
      <div className="h-screen overflow-hidden w-full flex bg-background items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    }>
      <ForgotPasswordForm />
    </Suspense>
  );
}
