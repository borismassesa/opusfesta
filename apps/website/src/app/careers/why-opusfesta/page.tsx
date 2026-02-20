import { Suspense } from "react";
import { WhyOpusFestaClient } from "./WhyOpusFestaClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Why OpusFesta | Careers",
  description: "Learn about OpusFesta's mission, vision, and what makes us unique. Join us in building Tanzania's go-to wedding & events marketplace.",
};

export default function WhyOpusFestaPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-background text-foreground min-h-screen flex items-center justify-center">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      }
    >
      <WhyOpusFestaClient />
    </Suspense>
  );
}
