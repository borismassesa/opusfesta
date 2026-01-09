"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CareersPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to jobs page
    router.replace("/careers/jobs");
  }, [router]);

  return null;
}
