import { Suspense } from "react";
import { HowWeHireClient } from "./HowWeHireClient";

export const dynamic = "force-dynamic";

export default function HowWeHirePage() {
  return (
    <Suspense
      fallback={
        <div className="bg-background text-primary min-h-screen flex items-center justify-center">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      }
    >
      <HowWeHireClient />
    </Suspense>
  );
}
