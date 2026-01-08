import { Suspense } from "react";
import { ApplyClient } from "./ApplyClient";

export const dynamic = "force-dynamic";

export default function ApplyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="bg-background text-primary min-h-screen flex items-center justify-center">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      }
    >
      <ApplyClient params={params} />
    </Suspense>
  );
}
