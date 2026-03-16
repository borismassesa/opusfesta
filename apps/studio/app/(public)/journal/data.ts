export interface JournalPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string; // HTML or Markdown normally; using raw text for this mock
  category: string;
  date: string;
  readTime: string;
  imageUrl: string;
  author: {
    name: string;
    role: string;
    avatarUrl: string;
  };
}

export const CATEGORIES = [
  'All',
  'Behind the Scenes',
  'Design Philosophy',
  'Event Spotlights',
  'Industry Trends',
];

export const MOCK_JOURNAL_POSTS: JournalPost[] = [
  {
    id: 'post-1',
    slug: 'the-meridian-experience-behind-the-scenes',
    title: 'Designing the Meridian Experience: A Look Behind the Curtain',
    excerpt: 'How we transformed a historic bank vault into an immersive, multi-sensory brand activation for The Meridian Group.',
    content: `
      <p>The Meridian Experience was born out of a simple question: what does trust feel like? When the client approached us to design their annual summit, we knew a standard ballroom wouldn't suffice.</p>
      <br />
      <p>We secured an abandoned, historic bank vault in the heart of the financial district. The juxtaposition of the raw, imposing steel doors with delicate, ethereal lighting created an atmosphere of both security and boundless possibility.</p>
      <br />
      <h3>The Sensory Journey</h3>
      <p>Every element was curated. From the custom scent—a blend of cedar and petrichor—to the bespoke acoustic dampening that made whispers carry. Guests didn't just attend an event; they stepped into a meticulously crafted reality.</p>
    `,
    category: 'Behind the Scenes',
    date: 'March 12, 2026',
    readTime: '6 min read',
    imageUrl: 'https://images.unsplash.com/photo-1511527661048-7fe73d85e9a4?q=80&w=1200&auto=format&fit=crop',
    author: {
      name: 'Elena Rostova',
      role: 'Creative Director',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop',
    },
  },
  {
    id: 'post-2',
    slug: 'minimalism-in-event-design',
    title: 'The Power of Empty Space: Minimalism in Event Architecture',
    excerpt: 'Why the most memorable experiences often rely on what is removed rather than what is added.',
    content: `
      <p>In a world of constant overstimulation, silence is a luxury. We apply this principle strictly to our spatial design. An empty corner is not a missed opportunity; it is a visual resting place that allows the focal points to breathe.</p>
    `,
    category: 'Design Philosophy',
    date: 'February 28, 2026',
    readTime: '4 min read',
    imageUrl: 'https://images.unsplash.com/photo-1507676184212-d0330a15233c?q=80&w=1200&auto=format&fit=crop',
    author: {
      name: 'Marcus Chen',
      role: 'Lead Spatial Designer',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop',
    },
  },
  {
    id: 'post-3',
    slug: 'sustainability-in-luxury',
    title: 'Refining Luxury: Zero-Waste Practices in High-End Events',
    excerpt: 'Luxury and sustainability are no longer mutually exclusive. Exploring our new zero-waste framework.',
    content: `
      <p>True luxury lies in intentionality. If an event generates staggering waste, its beauty is fundamentally compromised. We have spent the last twelve months auditing our entire supply chain to ensure our spectacular moments leave no trace.</p>
    `,
    category: 'Industry Trends',
    date: 'February 15, 2026',
    readTime: '8 min read',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop',
    author: {
      name: 'Sarah Jenkins',
      role: 'Operations Lead',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop',
    },
  },
  {
    id: 'post-4',
    slug: 'rooftop-gala-spotlight',
    title: 'Twilight Convergence: The Annual Rooftop Gala',
    excerpt: 'A deep dive into the lighting and structural challenges of building a glass pavilion on a 40-story roof.',
    content: `
      <p>Building a temporary structure at an elevation of 400 feet introduces variables that standard ground-floor events simply do not encounter. Wind shear, crane logistics, and weight constraints dictated every design decision.</p>
    `,
    category: 'Event Spotlights',
    date: 'January 10, 2026',
    readTime: '5 min read',
    imageUrl: 'https://images.unsplash.com/photo-1519750783826-e2420f4d687f?q=80&w=1200&auto=format&fit=crop',
    author: {
      name: 'Elena Rostova',
      role: 'Creative Director',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop',
    },
  },
  {
    id: 'post-5',
    slug: 'the-psychology-of-color-in-experiential-design',
    title: 'Chroma & Mood: The Psychology of Event Lighting',
    excerpt: 'How subtle shifts in color temperature can alter guest behavior and emotional resonance.',
    content: `
      <p>Light is our most ephemeral and powerful material. We do not just illuminate a room; we paint emotional states. A shift from 3200K to 4000K can be the difference between intimacy and productivity.</p>
    `,
    category: 'Design Philosophy',
    date: 'December 05, 2025',
    readTime: '7 min read',
    imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop',
    author: {
      name: 'David Okafor',
      role: 'Lighting Director',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop',
    },
  },
];
