import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export default function Login() {
  return (
    <Suspense fallback={
      <div className="h-screen overflow-hidden w-full flex bg-background items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
