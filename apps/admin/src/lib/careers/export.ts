import Papa from "papaparse";
import jsPDF from "jspdf";

export interface ExportableJob {
  id: string;
  title: string;
  department: string;
  location: string;
  employment_type: string;
  salary_range: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExportableApplication {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  job_title: string;
  status: string;
  created_at: string;
}

export function exportJobsToCSV(jobs: ExportableJob[]): void {
  const csv = Papa.unparse(jobs, {
    columns: [
      "title",
      "department",
      "location",
      "employment_type",
      "salary_range",
      "is_active",
      "created_at",
    ],
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `job-postings-${new Date().toISOString().split("T")[0]}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportApplicationsToCSV(applications: ExportableApplication[]): void {
  const csv = Papa.unparse(applications, {
    columns: [
      "full_name",
      "email",
      "phone",
      "job_title",
      "status",
      "created_at",
    ],
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `job-applications-${new Date().toISOString().split("T")[0]}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportJobsToPDF(jobs: ExportableJob[]): void {
  const doc = new jsPDF();
  let y = 20;

  doc.setFontSize(18);
  doc.text("Job Postings Report", 14, y);
  y += 10;

  doc.setFontSize(12);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, y);
  y += 15;

  doc.setFontSize(10);
  jobs.forEach((job, index) => {
    if (y > 280) {
      doc.addPage();
      y = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.text(`${index + 1}. ${job.title}`, 14, y);
    y += 7;

    doc.setFont("helvetica", "normal");
    doc.text(`Department: ${job.department}`, 14, y);
    y += 5;
    doc.text(`Location: ${job.location}`, 14, y);
    y += 5;
    doc.text(`Type: ${job.employment_type}`, 14, y);
    y += 5;
    if (job.salary_range) {
      doc.text(`Salary: ${job.salary_range}`, 14, y);
      y += 5;
    }
    doc.text(`Status: ${job.is_active ? "Active" : "Inactive"}`, 14, y);
    y += 5;
    doc.text(`Created: ${new Date(job.created_at).toLocaleDateString()}`, 14, y);
    y += 10;
  });

  doc.save(`job-postings-${new Date().toISOString().split("T")[0]}.pdf`);
}

export function exportApplicationsToPDF(applications: ExportableApplication[]): void {
  const doc = new jsPDF();
  let y = 20;

  doc.setFontSize(18);
  doc.text("Job Applications Report", 14, y);
  y += 10;

  doc.setFontSize(12);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, y);
  y += 15;

  doc.setFontSize(10);
  applications.forEach((app, index) => {
    if (y > 280) {
      doc.addPage();
      y = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.text(`${index + 1}. ${app.full_name}`, 14, y);
    y += 7;

    doc.setFont("helvetica", "normal");
    doc.text(`Email: ${app.email}`, 14, y);
    y += 5;
    doc.text(`Phone: ${app.phone}`, 14, y);
    y += 5;
    doc.text(`Job: ${app.job_title}`, 14, y);
    y += 5;
    doc.text(`Status: ${app.status}`, 14, y);
    y += 5;
    doc.text(`Applied: ${new Date(app.created_at).toLocaleDateString()}`, 14, y);
    y += 10;
  });

  doc.save(`job-applications-${new Date().toISOString().split("T")[0]}.pdf`);
}
