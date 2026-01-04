import { Settings } from "lucide-react";

export default function AdminPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center opacity-60">
      <div className="w-20 h-20 bg-surface/50 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-border shadow-xl">
        <Settings className="w-10 h-10 text-muted-foreground/50" />
      </div>
      <h2 className="text-2xl font-semibold tracking-tight">Under Construction</h2>
      <p className="text-muted-foreground mt-2 max-w-sm">
        This module is part of the planned ERP system rollout.
      </p>
    </div>
  );
}
