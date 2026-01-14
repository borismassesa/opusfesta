import { Suspense } from "react";
import { StudentsClient } from "./StudentsClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Students | Careers",
  description: "Explore opportunities for students at OpusFesta. Internships, part-time positions, and early career opportunities.",
};

export default function StudentsPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-background text-primary min-h-screen flex items-center justify-center">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      }
    >
      <StudentsClient />
    </Suspense>
  );
}
