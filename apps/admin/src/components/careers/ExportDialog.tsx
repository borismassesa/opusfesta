"use client";

import { Download, FileText, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { exportJobsToCSV, exportJobsToPDF, exportApplicationsToCSV, exportApplicationsToPDF } from "@/lib/careers/export";

interface ExportDialogProps {
  type: "jobs" | "applications";
  data: any[];
  trigger?: React.ReactNode;
}

export function ExportDialog({ type, data, trigger }: ExportDialogProps) {
  const handleCSVExport = () => {
    if (type === "jobs") {
      exportJobsToCSV(data);
    } else {
      exportApplicationsToCSV(data);
    }
  };

  const handlePDFExport = () => {
    if (type === "jobs") {
      exportJobsToPDF(data);
    } else {
      exportApplicationsToPDF(data);
    }
  };

  const defaultTrigger = (
    <Button variant="outline">
      <Download className="w-4 h-4 mr-2" />
      Export {type === "jobs" ? "Jobs" : "Applications"}
    </Button>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export {type === "jobs" ? "Job Postings" : "Applications"}</DialogTitle>
          <DialogDescription>
            Choose a format to export {data.length} {type === "jobs" ? "job posting(s)" : "application(s)"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleCSVExport}
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Export as CSV
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handlePDFExport}
          >
            <FileText className="w-4 h-4 mr-2" />
            Export as PDF
          </Button>
        </div>
        <DialogFooter>
          <p className="text-sm text-muted-foreground">
            CSV files can be opened in Excel, Google Sheets, or any spreadsheet application.
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
