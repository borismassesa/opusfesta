import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function ServiceDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: serviceId } = await params;

  // In a real app, we'd fetch service details based on ID
  // For now, we'll just display the ID nicely
  const formattedTitle = serviceId 
    ? serviceId.charAt(0).toUpperCase() + serviceId.slice(1).replace("-", " ") 
    : "Service";

  return (
    <div className="min-h-screen bg-background text-primary flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center space-y-8">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-medium text-secondary hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          {formattedTitle}
        </h1>
        
        <p className="text-xl text-secondary leading-relaxed">
          This is a placeholder page for the {formattedTitle} service details.
          In a full application, this would contain specific features, pricing, and functionality for this service.
        </p>

        <div className="p-6 border border-dashed border-border rounded-lg bg-surface/50">
          <p className="font-mono text-xs text-muted-foreground">
            Route: /services/{serviceId}
          </p>
        </div>
      </div>
    </div>
  );
}
