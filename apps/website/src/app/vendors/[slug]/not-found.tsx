import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function VendorNotFound() {
  return (
    <div className="bg-background text-foreground min-h-screen flex items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div>
          <h1 className="text-4xl md:text-6xl font-semibold mb-4">
            Vendor Not Found
          </h1>
          <p className="text-lg text-secondary leading-relaxed">
            The vendor you're looking for doesn't exist or has been removed.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/vendors"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-background rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Browse All Vendors
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 border border-border bg-background rounded-lg font-semibold hover:bg-surface transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

