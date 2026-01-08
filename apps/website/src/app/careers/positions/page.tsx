import { Suspense } from "react";
import { PositionsClient } from "./PositionsClient";

export const dynamic = "force-dynamic";

export default function PositionsPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-background text-primary min-h-screen flex items-center justify-center">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      }
    >
      <PositionsClient />
    </Suspense>
  );
}
