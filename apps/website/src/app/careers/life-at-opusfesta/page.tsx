import { Suspense } from "react";
import { LifeAtOpusFestaClient } from "./LifeAtOpusFestaClient";

export const dynamic = "force-dynamic";

export default function LifeAtOpusFestaPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-background text-foreground min-h-screen flex items-center justify-center">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      }
    >
      <LifeAtOpusFestaClient />
    </Suspense>
  );
}
