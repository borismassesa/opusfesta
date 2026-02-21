// Shared data for projects, articles, and services

export interface Project {
  id: string;
  slug: string;
  number: string;
  category: string;
  title: string;
  description: string;
  image: string;
  stats: { label: string; value: string }[];
  highlights: string[];
  fullDescription: string;
}

export interface Article {
  id: string;
  slug: string;
  image: string;
  date: string;
  title: string;
  author: string;
  category: string;
  excerpt: string;
  body: string[];
}

export interface Service {
  id: string;
  title: string;
  description: string;
  price: string;
  image: string;
  includes: string[];
}

export const projects: Project[] = [
  {
    id: 'proj-1',
    slug: 'the-meridian-experience',
    number: '01',
    category: 'Wedding Film',
    title: 'THE MERIDIAN EXPERIENCE',
    description: 'A full-day cinematic wedding captured across three stunning venues in the Scottish Highlands.',
    image: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/bcced374-a515-4136-bef9-e31a8cd1c18f_1600w.jpg',
    stats: [
      { label: 'Duration', value: '14 Hours' },
      { label: 'Locations', value: '3 Venues' },
      { label: 'Deliverables', value: 'Film + Photos' },
      { label: 'Guests', value: '180' },
    ],
    highlights: [
      'Full-day cinematic coverage from morning preparations to final dance',
      'Drone footage across three Scottish Highland venues',
      'Same-day highlight reel premiered during reception',
      '8-minute cinematic film with bespoke soundtrack',
    ],
    fullDescription: 'The Meridian Experience was a once-in-a-lifetime celebration spanning three breathtaking venues across the Scottish Highlands. From intimate morning preparations in a centuries-old stone cottage to a grand ceremony overlooking the lochs, and finally a wild reception in a converted barn — every moment was captured with cinematic precision. Our team of four worked seamlessly across all locations, using drone coverage to showcase the dramatic Highland landscape. The couple received a same-day highlight reel that premiered during their reception, followed by a full 8-minute cinematic film with a bespoke soundtrack composed to match the emotional arc of their day.',
  },
  {
    id: 'proj-2',
    slug: 'rooftop-gala-night',
    number: '02',
    category: 'Event Coverage',
    title: 'ROOFTOP GALA NIGHT',
    description: 'High-energy photography capturing 400 guests at an exclusive London rooftop charity gala.',
    image: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/ffd0641a-688d-4761-a530-60fec416aab1_1600w.webp',
    stats: [
      { label: 'Guests', value: '400+' },
      { label: 'Photos Delivered', value: '850+' },
      { label: 'Same-Day Previews', value: '50' },
      { label: 'Coverage', value: '8 Hours' },
    ],
    highlights: [
      'Two-photographer team covering all angles simultaneously',
      '50 same-day preview images shared via live gallery during event',
      'Professional lighting setup for indoor/outdoor transitions',
      'Full gallery delivered within 72 hours',
    ],
    fullDescription: 'The Rooftop Gala Night was an exclusive charity event held at one of London\'s most prestigious rooftop venues, attracting over 400 guests from the worlds of fashion, philanthropy, and entertainment. Our two-photographer team captured the electric atmosphere across both the interior cocktail lounge and the open-air terrace. We deployed a live gallery that shared 50 same-day preview images during the event itself, giving guests instant access to professional shots. The full gallery of 850+ meticulously edited images was delivered within 72 hours — a rapid turnaround that allowed the client to dominate social media coverage while the event was still fresh.',
  },
  {
    id: 'proj-3',
    slug: 'vision-2030-summit',
    number: '03',
    category: 'Corporate',
    title: 'VISION 2030 SUMMIT',
    description: 'Brand film and event documentation for a Fortune 500 annual leadership summit.',
    image: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/792defd4-d702-4f36-b352-ba625129dfb5_3840w.webp',
    stats: [
      { label: 'Attendees', value: '1,200' },
      { label: 'Filming Days', value: '3' },
      { label: 'Final Cut', value: '6 Min Film' },
      { label: 'Social Cuts', value: '12' },
    ],
    highlights: [
      'Three-day comprehensive coverage of keynotes, panels, and networking',
      'Interview segments with 8 C-suite executives',
      '6-minute brand film used for investor relations',
      '12 social media cuts optimised for LinkedIn and Instagram',
    ],
    fullDescription: 'The Vision 2030 Summit brought together 1,200 leaders from across the globe for a three-day conference focused on the future of sustainable business. We embedded our team throughout the event, capturing keynote speeches, panel discussions, behind-the-scenes moments, and candid networking interactions. The centrepiece deliverable was a 6-minute brand film that told the story of the summit\'s ambitions and impact, used extensively in post-event investor relations. Additionally, we produced 12 bespoke social media cuts optimised for LinkedIn and Instagram, alongside sit-down interviews with 8 C-suite executives. The result was a comprehensive content library that extended the summit\'s impact well beyond the event itself.',
  },
  {
    id: 'proj-4',
    slug: 'brand-launch-film',
    number: '04',
    category: 'Commercial',
    title: 'BRAND LAUNCH FILM',
    description: 'Concept-to-delivery commercial for a luxury heritage brand entering a new market.',
    image: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/d2607b57-3a19-48e4-8ad4-bdcf6e69b207_3840w.webp',
    stats: [
      { label: 'Production Days', value: '5' },
      { label: 'Locations', value: '4' },
      { label: 'Final Cut', value: '90 Seconds' },
      { label: 'Views (Month 1)', value: '2.4M' },
    ],
    highlights: [
      'Full creative direction from concept through final delivery',
      'Shot across 4 locations over 5 production days',
      'Cinema-grade RED camera system with custom colour grade',
      'Achieved 2.4 million views within first month of launch',
    ],
    fullDescription: 'When a luxury heritage brand approached us to create their market entry film, we knew this demanded nothing less than cinematic excellence. Over five production days across four carefully scouted locations, we crafted a 90-second commercial that captured the brand\'s essence — timeless craftsmanship meeting modern ambition. Shot on RED cinema cameras with premium anamorphic lenses, every frame was composed to communicate luxury. Our in-house colour grade gave the piece a distinctive warmth that set it apart in a market saturated with cold, clinical brand content. The film launched across digital and social channels, accumulating 2.4 million views in its first month and becoming the centrepiece of the brand\'s market entry campaign.',
  },
];

export const articles: Article[] = [
  {
    id: 'article-1',
    slug: 'designing-systems-that-dont-feel-systematic',
    image: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/74ce626d-5eba-470d-a4e4-159b9c6cad3c_3840w.webp',
    date: 'July 11, 2025',
    title: "Designing Systems That Don't Feel Systematic",
    author: 'OpusFesta Studio',
    category: 'Process',
    excerpt: 'How we build creative workflows that leave room for instinct, improvisation, and happy accidents.',
    body: [
      'Every studio needs systems. Without them, deadlines slip, files get lost, and clients lose confidence. But the best creative work rarely comes from rigid processes — it comes from structured freedom.',
      'At OpusFesta Studio, we\'ve spent years refining workflows that give our team just enough structure to stay on track, while preserving the creative spontaneity that makes our work distinctive. We call it "loose architecture" — a framework that guides without constraining.',
      'Our process starts with a detailed creative brief, but we deliberately leave room for discovery. During a shoot, our cinematographers are encouraged to follow moments that feel right, even if they weren\'t in the shot list. Some of our most powerful footage has come from these unplanned detours.',
      'In post-production, we use a modular editing approach. Rather than locking into a rigid timeline from the start, we build sequences independently and then assemble them based on emotional flow. This allows us to experiment with narrative structure without losing efficiency.',
      'The key insight? Systems should serve creativity, not replace it. When we hire new team members, we look for people who thrive within flexible structures — those who understand that a process is a starting point, not a prison.',
      'This philosophy extends to client collaboration too. We share work-in-progress edits early and often, inviting feedback that shapes the final product. It\'s messier than a waterfall delivery, but it consistently produces work that surprises and delights.',
    ],
  },
  {
    id: 'article-2',
    slug: 'behind-the-scenes-of-our-latest-product-film',
    image: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/79b36b7a-a9b2-4eb8-a45d-27fe69423a98_3840w.jpg',
    date: 'June 03, 2025',
    title: 'Behind the Scenes of Our Latest Product Film',
    author: 'OpusFesta Studio',
    category: 'Motion',
    excerpt: 'A look inside the three-day shoot that brought a heritage brand to life through cinematic storytelling.',
    body: [
      'Three days. Four locations. One story. That was the brief for our latest product film — a cinematic piece for a heritage brand making its first move into a new market.',
      'The project began six weeks before the cameras rolled, with extensive pre-production. We scouted locations, built mood boards, developed a shot list, and worked closely with the brand\'s creative director to ensure every frame would align with their vision.',
      'Day one was all about the product itself. We set up in a controlled studio environment with careful lighting designed to bring out the texture and craftsmanship of each piece. Our macro lens work captured details invisible to the naked eye — the weave of fabric, the grain of leather, the precision of stitching.',
      'Days two and three took us on location. From a sunlit courtyard in the morning to a moody industrial space in the afternoon, we moved between environments that reflected the brand\'s dual identity: heritage and modernity.',
      'The biggest challenge? Rain on day three. Our outdoor sequence was planned for golden hour, but the weather had other ideas. Instead of waiting, we adapted — and the rain-soaked cobblestones and diffused light actually gave us some of the film\'s most atmospheric shots.',
      'In post-production, our colourist spent three full days developing a bespoke grade that gave the film its distinctive warm, analogue feel. The final 90-second cut launched across digital channels and has since accumulated over two million views.',
    ],
  },
  {
    id: 'article-3',
    slug: 'why-we-treat-every-brief-like-a-short-film',
    image: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/bb37e13b-1cf2-4a1f-ad35-d5499d2a18a2_3840w.webp',
    date: 'May 19, 2025',
    title: 'Why We Treat Every Brief Like a Short Film',
    author: 'OpusFesta Studio',
    category: 'Culture',
    excerpt: 'Our philosophy on approaching client work with the same craft and narrative rigour as independent filmmaking.',
    body: [
      'There\'s a trap that creative studios fall into. Client work becomes "just a job" — technically competent but emotionally flat. The brief gets ticked off, the invoice gets sent, and nobody feels particularly proud of what was made.',
      'At OpusFesta Studio, we made a decision early on: every project gets treated like a short film. Not in terms of budget or timeline, but in terms of narrative intention. Every piece we create needs to tell a story worth watching.',
      'What does that look like in practice? It starts with the question we ask in every kickoff meeting: "What\'s the emotion?" Not "What\'s the message?" or "What\'s the deliverable?" but "How should someone feel after watching this?"',
      'That single reframe changes everything. A wedding film isn\'t a record of events — it\'s a love story. A corporate video isn\'t a capability showcase — it\'s an origin story. A product launch isn\'t a spec sheet — it\'s an aspiration.',
      'This approach demands more from us. It means spending time understanding the people behind the brief, not just the brief itself. It means proposing creative ideas that push beyond what was asked for. And it means being willing to reshoot or re-edit if something doesn\'t land emotionally.',
      'The result? Work that our clients genuinely love sharing. Not because it hits the brief — although it always does — but because it captures something real. Something they recognise as authentically theirs, told through a lens they hadn\'t imagined.',
    ],
  },
];

export const services: Service[] = [
  {
    id: '01',
    title: 'WEDDING CINEMA',
    description: 'Full-day coverage capturing every emotion, from the quiet preparations to the last dance. Delivered as a cinematic short film and full ceremony edit.',
    price: 'From \u00a32,500',
    image: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/048e0a68-a97c-46dd-aed4-734f98009a4c_3840w.webp',
    includes: ['Cinematic Highlight Film', 'Full Ceremony Edit', 'Drone Coverage'],
  },
  {
    id: '02',
    title: 'EVENT PHOTOGRAPHY',
    description: 'High-energy event coverage that captures the atmosphere, the people, and the moments in between. Perfect for galas, launches, and private celebrations.',
    price: 'From \u00a31,200',
    image: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/ad97e439-6931-4e5e-bcf3-b69be4018905_3840w.webp',
    includes: ['300+ Edited Photos', 'Same-Day Previews', 'Online Gallery'],
  },
  {
    id: '03',
    title: 'CORPORATE MILESTONES',
    description: "Professional documentation of your company's key moments \u2014 conferences, team retreats, product launches, and annual celebrations.",
    price: 'From \u00a33,000',
    image: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/52b4be58-0ae9-4f19-88ed-d742fc1abef3_3840w.jpg',
    includes: ['Photo & Video Package', 'Brand-Ready Edits', 'Social Media Cuts'],
  },
  {
    id: '04',
    title: 'COMMERCIAL ADS',
    description: 'Concept-to-delivery commercial production for brands that want to stand out. We handle creative direction, filming, and post-production.',
    price: 'From \u00a35,000',
    image: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/71087bc3-4cb0-48eb-b49a-6a1587f575d7_3840w.jpg',
    includes: ['Creative Direction', '4K Production', 'Colour Grading'],
  },
  {
    id: '05',
    title: 'MUSIC VIDEOS',
    description: 'Visually striking music videos that match the energy and emotion of your sound. From concept through final colour grade.',
    price: 'From \u00a33,500',
    image: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/74ce626d-5eba-470d-a4e4-159b9c6cad3c_3840w.webp',
    includes: ['Storyboarding', 'Multi-Location Shoot', 'Post-Production'],
  },
  {
    id: '06',
    title: 'BRAND CONTENT',
    description: 'Ongoing visual content for brands that need a consistent, high-quality presence across digital platforms and campaigns.',
    price: 'From \u00a31,800',
    image: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/bb37e13b-1cf2-4a1f-ad35-d5499d2a18a2_3840w.webp',
    includes: ['Monthly Content Plan', 'Reels & Shorts', 'Product Photography'],
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

export const serviceNames = services.map((s) => s.title);
