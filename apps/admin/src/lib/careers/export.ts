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

export interface JobPostingForExport {
  id: string;
  title: string;
  department: string;
  location: string;
  employment_type: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  salary_range: string | null;
  is_active: boolean;
  about_thefesta?: string | null;
  benefits?: string[] | null;
  growth_description?: string | null;
  hiring_process?: string[] | null;
  how_to_apply?: string | null;
  equal_opportunity_statement?: string | null;
}

// Helper function to strip HTML tags
function stripHtml(html: string): string {
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

export function exportJobPostingToPDF(job: JobPostingForExport): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const maxWidth = pageWidth - 2 * margin;
  let y = 20;

  // Title
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  const titleLines = doc.splitTextToSize(job.title, maxWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 8 + 5;

  // Job Details
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  const details = [
    `Department: ${job.department}`,
    `Location: ${job.location}`,
    `Employment Type: ${job.employment_type}`,
  ];
  if (job.salary_range) {
    details.push(`Salary Range: ${job.salary_range}`);
  }
  details.forEach((detail) => {
    doc.text(detail, margin, y);
    y += 6;
  });
  y += 5;

  // About OpusFesta
  if (job.about_thefesta) {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("About OpusFesta", margin, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const aboutText = stripHtml(job.about_thefesta);
    const aboutLines = doc.splitTextToSize(aboutText, maxWidth);
    doc.text(aboutLines, margin, y);
    y += aboutLines.length * 5 + 5;
  }

  // The Role
  if (y > 270) {
    doc.addPage();
    y = 20;
  }
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("The Role", margin, y);
  y += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const descriptionText = stripHtml(job.description);
  const descriptionLines = doc.splitTextToSize(descriptionText, maxWidth);
  doc.text(descriptionLines, margin, y);
  y += descriptionLines.length * 5 + 5;

  // What You'll Do
  if (job.responsibilities && job.responsibilities.length > 0) {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("What You'll Do", margin, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    job.responsibilities.forEach((resp) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      const lines = doc.splitTextToSize(`• ${resp}`, maxWidth - 5);
      doc.text(lines, margin + 5, y);
      y += lines.length * 5 + 3;
    });
    y += 3;
  }

  // What We're Looking For
  if (job.requirements && job.requirements.length > 0) {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("What We're Looking For", margin, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    job.requirements.forEach((req) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      const lines = doc.splitTextToSize(`• ${req}`, maxWidth - 5);
      doc.text(lines, margin + 5, y);
      y += lines.length * 5 + 3;
    });
    y += 3;
  }

  // Why You'll Love Working at OpusFesta
  if (job.benefits && job.benefits.length > 0) {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Why You'll Love Working at OpusFesta", margin, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    job.benefits.forEach((benefit) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      const lines = doc.splitTextToSize(`• ${benefit}`, maxWidth - 5);
      doc.text(lines, margin + 5, y);
      y += lines.length * 5 + 3;
    });
    y += 3;
  }

  // Work Arrangement
  if (y > 270) {
    doc.addPage();
    y = 20;
  }
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Work Arrangement", margin, y);
  y += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Location: ${job.location}`, margin, y);
  y += 6;
  doc.text(`Employment Type: ${job.employment_type}`, margin, y);
  y += 8;

  // Growth at OpusFesta
  if (job.growth_description) {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Growth at OpusFesta", margin, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const growthText = stripHtml(job.growth_description);
    const growthLines = doc.splitTextToSize(growthText, maxWidth);
    doc.text(growthLines, margin, y);
    y += growthLines.length * 5 + 5;
  }

  // Our Hiring Process
  if (job.hiring_process && job.hiring_process.length > 0) {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Our Hiring Process", margin, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    job.hiring_process.forEach((step, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      const lines = doc.splitTextToSize(`${index + 1}. ${step}`, maxWidth - 5);
      doc.text(lines, margin + 5, y);
      y += lines.length * 5 + 3;
    });
    y += 3;
  }

  // How to Apply
  if (job.how_to_apply) {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("How to Apply", margin, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const applyText = stripHtml(job.how_to_apply);
    const applyLines = doc.splitTextToSize(applyText, maxWidth);
    doc.text(applyLines, margin, y);
    y += applyLines.length * 5 + 5;
  }

  // Equal Opportunity Statement
  if (job.equal_opportunity_statement) {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Equal Opportunity Statement", margin, y);
    y += 8;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const eeoText = stripHtml(job.equal_opportunity_statement);
    const eeoLines = doc.splitTextToSize(eeoText, maxWidth);
    doc.text(eeoLines, margin, y);
  }

  const safeTitle = job.title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  doc.save(`${safeTitle}-job-posting.pdf`);
}

// Helper function to escape XML special characters
function escapeXml(text: string): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Helper function to strip HTML and convert to plain text
function htmlToPlainText(html: string): string {
  if (!html) return "";
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

// Helper function to create a Word paragraph
function createWordParagraph(text: string, isBold = false, fontSize = 24): string {
  const escaped = escapeXml(text);
  const boldTag = isBold ? '<w:b/>' : '';
  return `<w:p><w:pPr><w:spacing w:after="120"/></w:pPr><w:r><w:rPr><w:sz w:val="${fontSize}"/>${boldTag}</w:rPr><w:t>${escaped}</w:t></w:r></w:p>`;
}

// Helper function to create a Word list item with bullet
function createWordListItem(text: string): string {
  const escaped = escapeXml(text);
  return `<w:p><w:pPr><w:spacing w:after="60"/><w:ind w:left="360" w:firstLine="0"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Symbol" w:hAnsi="Symbol"/></w:rPr><w:t>•</w:t></w:r><w:r><w:t xml:space="preserve"> ${escaped}</w:t></w:r></w:p>`;
}

export function exportJobPostingToWord(job: JobPostingForExport): void {
  // Word XML document structure
  let wordXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<?mso-application progid="Word.Document"?>
<w:wordDocument xmlns:w="http://schemas.microsoft.com/office/word/2003/wordml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w10="urn:schemas-microsoft-com:office:word" xmlns:sl="http://schemas.microsoft.com/schemaLibrary/2003/core" xmlns:aml="http://schemas.microsoft.com/aml/2001/core" xmlns:wx="http://schemas.microsoft.com/office/word/2003/auxHint" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:dt="uuid:C2F41010-65B3-11d1-A29F-00AA00C14882" xmlns:wsp="http://schemas.microsoft.com/office/word/2003/wordml/sp2" xmlns:st1="urn:schemas-microsoft-com:office:smarttags" w:macrosPresent="no" w:embeddedObjPresent="no" w:ocxPresent="no" xml:space="preserve">
<w:ignoreElements w:val="http://schemas.microsoft.com/office/word/2003/wordml/sp2"/>
<o:DocumentProperties>
<o:Title>${escapeXml(job.title)}</o:Title>
</o:DocumentProperties>
<w:fonts>
<w:defaultFonts w:ascii="Times New Roman" w:fareast="Times New Roman" w:h-ansi="Times New Roman" w:cs="Times New Roman"/>
</w:fonts>
<w:styles>
<w:versionOfBuiltInStylenames w:val="7"/>
<w:latentStyles w:defLockedState="off" w:latentCount="371">
<w:lsdException w:name="Normal"/>
</w:latentStyles>
</w:styles>
<w:docPr>
<w:view w:val="print"/>
<w:zoom w:percent="100"/>
</w:docPr>
<w:body>
<wx:sect>
`;

  // Title
  wordXml += createWordParagraph(job.title, true, 32);
  wordXml += '<w:p><w:r><w:t></w:t></w:r></w:p>'; // Empty line

  // Job Details
  wordXml += createWordParagraph(`Department: ${job.department}`, false, 24);
  wordXml += createWordParagraph(`Location: ${job.location}`, false, 24);
  wordXml += createWordParagraph(`Employment Type: ${job.employment_type}`, false, 24);
  if (job.salary_range) {
    wordXml += createWordParagraph(`Salary Range: ${job.salary_range}`, false, 24);
  }
  wordXml += '<w:p><w:r><w:t></w:t></w:r></w:p>'; // Empty line

  // About OpusFesta
  if (job.about_thefesta) {
    wordXml += createWordParagraph("About OpusFesta", true, 28);
    wordXml += '<w:p><w:r><w:t></w:t></w:r></w:p>'; // Empty line
    const aboutText = htmlToPlainText(job.about_thefesta);
    // Split by newlines and create paragraphs
    aboutText.split('\n').forEach(line => {
      if (line.trim()) {
        wordXml += createWordParagraph(line.trim(), false, 24);
      }
    });
    wordXml += '<w:p><w:r><w:t></w:t></w:r></w:p>'; // Empty line
  }

  // The Role
  wordXml += createWordParagraph("The Role", true, 28);
  wordXml += '<w:p><w:r><w:t></w:t></w:r></w:p>'; // Empty line
  const roleText = htmlToPlainText(job.description);
  roleText.split('\n').forEach(line => {
    if (line.trim()) {
      wordXml += createWordParagraph(line.trim(), false, 24);
    }
  });
  wordXml += '<w:p><w:r><w:t></w:t></w:r></w:p>'; // Empty line

  // What You'll Do
  if (job.responsibilities && job.responsibilities.length > 0) {
    wordXml += createWordParagraph("What You'll Do", true, 28);
    wordXml += '<w:p><w:r><w:t></w:t></w:r></w:p>'; // Empty line
    job.responsibilities.forEach((resp) => {
      wordXml += createWordListItem(resp);
    });
    wordXml += '<w:p><w:r><w:t></w:t></w:r></w:p>'; // Empty line
  }

  // What We're Looking For
  if (job.requirements && job.requirements.length > 0) {
    wordXml += createWordParagraph("What We're Looking For", true, 28);
    wordXml += '<w:p><w:r><w:t></w:t></w:r></w:p>'; // Empty line
    job.requirements.forEach((req) => {
      wordXml += createWordListItem(req);
    });
    wordXml += '<w:p><w:r><w:t></w:t></w:r></w:p>'; // Empty line
  }

  // Why You'll Love Working at OpusFesta
  if (job.benefits && job.benefits.length > 0) {
    wordXml += createWordParagraph("Why You'll Love Working at OpusFesta", true, 28);
    wordXml += '<w:p><w:r><w:t></w:t></w:r></w:p>'; // Empty line
    job.benefits.forEach((benefit) => {
      wordXml += createWordListItem(benefit);
    });
    wordXml += '<w:p><w:r><w:t></w:t></w:r></w:p>'; // Empty line
  }

  // Work Arrangement
  wordXml += createWordParagraph("Work Arrangement", true, 28);
  wordXml += '<w:p><w:r><w:t></w:t></w:r></w:p>'; // Empty line
  wordXml += createWordParagraph(`Location: ${job.location}`, false, 24);
  wordXml += createWordParagraph(`Employment Type: ${job.employment_type}`, false, 24);
  wordXml += '<w:p><w:r><w:t></w:t></w:r></w:p>'; // Empty line

  // Growth at OpusFesta
  if (job.growth_description) {
    wordXml += createWordParagraph("Growth at OpusFesta", true, 28);
    wordXml += '<w:p><w:r><w:t></w:t></w:r></w:p>'; // Empty line
    const growthText = htmlToPlainText(job.growth_description);
    growthText.split('\n').forEach(line => {
      if (line.trim()) {
        wordXml += createWordParagraph(line.trim(), false, 24);
      }
    });
    wordXml += '<w:p><w:r><w:t></w:t></w:r></w:p>'; // Empty line
  }

  // Our Hiring Process
  if (job.hiring_process && job.hiring_process.length > 0) {
    wordXml += createWordParagraph("Our Hiring Process", true, 28);
    wordXml += '<w:p><w:r><w:t></w:t></w:r></w:p>'; // Empty line
    job.hiring_process.forEach((step, index) => {
      wordXml += createWordParagraph(`${index + 1}. ${step}`, false, 24);
    });
    wordXml += '<w:p><w:r><w:t></w:t></w:r></w:p>'; // Empty line
  }

  // How to Apply
  if (job.how_to_apply) {
    wordXml += createWordParagraph("How to Apply", true, 28);
    wordXml += '<w:p><w:r><w:t></w:t></w:r></w:p>'; // Empty line
    const applyText = htmlToPlainText(job.how_to_apply);
    applyText.split('\n').forEach(line => {
      if (line.trim()) {
        wordXml += createWordParagraph(line.trim(), false, 24);
      }
    });
    wordXml += '<w:p><w:r><w:t></w:t></w:r></w:p>'; // Empty line
  }

  // Equal Opportunity Statement
  if (job.equal_opportunity_statement) {
    wordXml += createWordParagraph("Equal Opportunity Statement", true, 24);
    wordXml += '<w:p><w:r><w:t></w:t></w:r></w:p>'; // Empty line
    const eeoText = htmlToPlainText(job.equal_opportunity_statement);
    eeoText.split('\n').forEach(line => {
      if (line.trim()) {
        wordXml += createWordParagraph(line.trim(), false, 18);
      }
    });
  }

  // Close Word XML
  wordXml += `
</wx:sect>
</w:body>
</w:wordDocument>`;

  // Create a blob with the Word XML content
  const blob = new Blob([wordXml], { 
    type: "application/msword" 
  });

  // Create download link
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  const safeTitle = job.title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  link.setAttribute("href", url);
  link.setAttribute("download", `${safeTitle}-job-posting.doc`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
