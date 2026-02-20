import { Suspense } from "react";
import { BenefitsClient } from "./BenefitsClient";

export const dynamic = "force-dynamic";

export default function BenefitsPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-background text-foreground min-h-screen flex items-center justify-center">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      }
    >
      <BenefitsClient />
    </Suspense>
  );
}
