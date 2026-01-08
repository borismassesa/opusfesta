import { Suspense } from "react";
import { CareersClient } from "./CareersClient";

export const dynamic = "force-dynamic";

export default function CareersPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-background text-primary min-h-screen flex items-center justify-center">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      }
    >
      <CareersClient />
    </Suspense>
  );
}
