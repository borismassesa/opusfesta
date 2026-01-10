import type { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
  (process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : "https://admin.opusfestaevents.com");

export function getBaseMetadata(): Metadata {
  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: "OpusFesta Admin Portal",
      template: "%s | OpusFesta Admin",
    },
    description: "Manage your OpusFesta platform - vendors, bookings, content, and more.",
    keywords: ["OpusFesta", "Admin", "Wedding Planning", "Event Management"],
    authors: [{ name: "OpusFesta Team" }],
    creator: "OpusFesta",
    publisher: "OpusFesta",
    openGraph: {
      type: "website",
      locale: "en_US",
      url: baseUrl,
      siteName: "OpusFesta Admin Portal",
      title: "OpusFesta Admin Portal",
      description: "Manage your OpusFesta platform - vendors, bookings, content, and more.",
      images: [
        {
          url: "/opengraph-admin.png",
          width: 1200,
          height: 630,
          alt: "OpusFesta Admin Portal",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "OpusFesta Admin Portal",
      description: "Manage your OpusFesta platform - vendors, bookings, content, and more.",
      images: ["/opengraph-admin.png"],
      creator: "@opusfesta",
    },
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
    icons: {
      icon: [
        { url: "/favicon.png", sizes: "any", type: "image/png" },
      ],
      shortcut: "/favicon.png",
      apple: "/favicon.png",
    },
  };
}

export function getJobPostingMetadata(job: {
  title: string;
  department: string;
  location: string;
  description?: string | null;
}): Metadata {
  const description = job.description 
    ? job.description.replace(/<[^>]*>/g, '').substring(0, 160) + "..."
    : `${job.title} at OpusFesta - ${job.department} in ${job.location}`;

  return {
    title: `${job.title} | Job Posting`,
    description,
    openGraph: {
      title: `${job.title} | OpusFesta Admin`,
      description,
      type: "website",
      url: `${baseUrl}/careers/jobs/${job.title.toLowerCase().replace(/\s+/g, '-')}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${job.title} | OpusFesta Admin`,
      description,
    },
  };
}
