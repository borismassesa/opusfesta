export interface StudioProject {
  id: string;
  slug: string;
  number: string;
  category: string;
  title: string;
  description: string;
  image: string;
  story: string;
}

export const STUDIO_PROJECTS: StudioProject[] = [
  {
    id: "proj-1",
    slug: "meridian-experience",
    number: "01",
    category: "Wedding Film",
    title: "THE MERIDIAN EXPERIENCE",
    description: "A full-day cinematic wedding captured across three stunning venues in the Scottish Highlands.",
    image: "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/bcced374-a515-4136-bef9-e31a8cd1c18f_1600w.jpg",
    story:
      "A three-day destination wedding film crafted around mountain light, handwritten vows, and a midnight ceilidh set. The final edit blended documentary pacing with orchestral scoring for a timeless cinematic finish.",
  },
  {
    id: "proj-2",
    slug: "rooftop-gala-night",
    number: "02",
    category: "Event Coverage",
    title: "ROOFTOP GALA NIGHT",
    description: "High-energy photography capturing 400 guests at an exclusive London rooftop charity gala.",
    image: "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/ffd0641a-688d-4761-a530-60fec416aab1_1600w.webp",
    story:
      "Our team captured live moments, donor speeches, and elevated lifestyle imagery in a single run-and-gun setup. Same-night social selects helped the organizers double post-event engagement.",
  },
  {
    id: "proj-3",
    slug: "vision-2030-summit",
    number: "03",
    category: "Corporate",
    title: "VISION 2030 SUMMIT",
    description: "Brand film and event documentation for a Fortune 500 annual leadership summit.",
    image: "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/792defd4-d702-4f36-b352-ba625129dfb5_3840w.webp",
    story:
      "A multi-camera conference production delivered keynote edits, culture photography, and an internal launch film that aligned executive messaging with employee storytelling.",
  },
  {
    id: "proj-4",
    slug: "brand-launch-film",
    number: "04",
    category: "Commercial",
    title: "BRAND LAUNCH FILM",
    description: "Concept-to-delivery commercial for a luxury heritage brand entering a new market.",
    image: "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/d2607b57-3a19-48e4-8ad4-bdcf6e69b207_3840w.webp",
    story:
      "From storyboard to final color grade, we delivered a full-funnel campaign film plus social cutdowns designed for launch week performance and retail in-store displays.",
  },
];

export const STUDIO_SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/opusfesta",
  x: "https://x.com/opusfesta",
  linkedin: "https://www.linkedin.com/company/opusfesta",
  telegram: "https://t.me/opusfesta",
} as const;
