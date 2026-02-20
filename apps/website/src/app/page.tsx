import { Suspense } from "react";
import { HomeClient } from "./HomeClient";

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <Suspense fallback={
      <div className="bg-background text-foreground min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    }>
      <HomeClient />
    </Suspense>
  );
}
