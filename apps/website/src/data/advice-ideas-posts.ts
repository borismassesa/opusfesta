/**
 * Advice & Ideas – wedding planning content.
 * Images live at /images/advice-ideas/.
 */

export const ADVICE_IDEAS_PATH = "/advice-and-ideas";

export type AdviceIdeasPost = {
  id: number;
  slug: string;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  date: string;
  category: string;
  author: string;
  avatarUrl: string;
  readTime: number;
  featured: boolean;
  /** HTML for article body (repo uses MDX; we use HTML so layout matches) */
  content?: string;
};

export const categoryToId = (category: string) =>
  category
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const adviceIdeasPosts: AdviceIdeasPost[] = [
  {
    id: 1,
    slug: "wedding-planning-timeline",
    title: "Your Wedding Planning Timeline: A Month-by-Month Guide",
    description: "A realistic timeline to keep decisions clear, calm, and on track.",
    imageUrl: "/images/advice-ideas/post-1.webp",
    imageAlt: "Wedding planning calendar and notebook",
    date: "Jan 12, 2026",
    category: "Planning Timeline",
    author: "Ava Monroe",
    avatarUrl: "/images/advice-ideas/avatars/1.webp",
    readTime: 10,
    featured: true,
    content: `
<h2>Start with the big picture</h2>
<p>Before you open spreadsheets, align on three priorities and a realistic guest range. Your guest count drives the budget, venue size, catering, and almost every downstream decision.</p>

<h3>12 to 9 months out</h3>
<ul>
  <li>Choose your date range and lock the venue.</li>
  <li>Set a working budget with a 10 percent buffer.</li>
  <li>Book your planner and photographer if you want one.</li>
  <li>Start a shared planning doc for decisions and vendor contacts.</li>
</ul>

<h3>8 to 6 months out</h3>
<ul>
  <li>Secure catering, entertainment, florist, and officiant.</li>
  <li>Build a moodboard and pick a color palette.</li>
  <li>Outline the ceremony and reception flow.</li>
  <li>Reserve hotel blocks or transportation if needed.</li>
</ul>

<h3>5 to 3 months out</h3>
<ul>
  <li>Order attire and schedule fittings.</li>
  <li>Finalize menu tasting and bar selections.</li>
  <li>Send save-the-dates or invitations.</li>
  <li>Draft a day-of timeline with key vendors.</li>
</ul>

<h3>8 to 6 weeks out</h3>
<ul>
  <li>Collect RSVPs and follow up once.</li>
  <li>Confirm rentals, linens, and floor plan.</li>
  <li>Plan ceremony details, readings, and vows.</li>
  <li>Create a shot list and family formal list.</li>
</ul>

<h3>Month of</h3>
<ul>
  <li>Finalize seating, signage, and print materials.</li>
  <li>Share a detailed timeline with all vendors.</li>
  <li>Schedule a final walkthrough at the venue.</li>
  <li>Pack an emergency kit and confirm payments.</li>
</ul>

<figure>
  <img src="/images/advice-ideas/post-1.webp" alt="Wedding planning notebook and desk" />
  <figcaption>Keep your plan simple and visible for anyone helping on the day.</figcaption>
</figure>

<h2>Sample day-of flow</h2>
<ol>
  <li>2:00 PM - Getting ready and detail photos.</li>
  <li>4:00 PM - First look or pre-ceremony portraits.</li>
  <li>5:00 PM - Ceremony.</li>
  <li>5:30 PM - Cocktail hour and family formals.</li>
  <li>7:00 PM - Dinner and toasts.</li>
  <li>8:30 PM - Dancing.</li>
  <li>10:30 PM - Send-off.</li>
</ol>

<blockquote>
  “A calm, realistic timeline is the single best gift you can give yourself on wedding day.”
</blockquote>

<h2>Quick timeline video</h2>
<video controls poster="/images/advice-ideas/post-2.webp">
  <source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" type="video/mp4" />
  Your browser does not support the video tag.
</video>

<h2>Final checklist</h2>
<ul>
  <li>Confirm vendor arrival times and load-in.</li>
  <li>Share VIP contact list for day-of questions.</li>
  <li>Pack rings, vows, and payment envelopes.</li>
  <li>Assign one point person for each vendor.</li>
</ul>
`,
  },
  {
    id: 2,
    slug: "budget-allocations-that-work",
    title: "Budgeting That Feels Real: How to Allocate Your Wedding Spend",
    description: "A simple way to split your budget and avoid surprise costs.",
    imageUrl: "/images/advice-ideas/post-2.webp",
    imageAlt: "Wedding budget worksheet and calculator",
    date: "Jan 28, 2026",
    category: "Budgeting",
    author: "Jordan Lee",
    avatarUrl: "/images/advice-ideas/avatars/2.webp",
    readTime: 9,
    featured: false,
    content: `
<h2>Start with your ceiling and guest count</h2>
<p>Pick the total number you will not exceed, then set a firm guest count range. If you change one, you almost always change the other.</p>

<h3>Separate fixed and flexible costs</h3>
<ul>
  <li>Fixed: venue, catering minimums, rentals, permits, planner.</li>
  <li>Flexible: florals, decor, paper goods, favors, late-night food.</li>
</ul>

<h2>Suggested allocation ranges</h2>
<table>
  <thead>
    <tr>
      <th>Category</th>
      <th>Typical Range</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Venue + Catering</td>
      <td>40–50%</td>
    </tr>
    <tr>
      <td>Photography + Video</td>
      <td>10–15%</td>
    </tr>
    <tr>
      <td>Attire + Beauty</td>
      <td>7–10%</td>
    </tr>
    <tr>
      <td>Florals + Decor</td>
      <td>8–12%</td>
    </tr>
    <tr>
      <td>Entertainment</td>
      <td>6–10%</td>
    </tr>
  </tbody>
</table>

<h2>Hidden costs to plan for</h2>
<ul>
  <li>Service charges, gratuities, and overtime.</li>
  <li>Delivery and pickup fees for rentals.</li>
  <li>Day-of insurance, permits, or security.</li>
  <li>Weather plans such as tents or heaters.</li>
</ul>

<figure>
  <img src="/images/advice-ideas/post-2.webp" alt="Budget worksheet and calculator" />
  <figcaption>Track estimates, deposits, and final balances in one place.</figcaption>
</figure>

<h2>Budget walk-through</h2>
<video controls poster="/images/advice-ideas/post-6.webp">
  <source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" type="video/mp4" />
  Your browser does not support the video tag.
</video>

<h2>Ways to save without sacrificing</h2>
<ol>
  <li>Reduce the guest list by 10 percent and reallocate to priorities.</li>
  <li>Choose in-season flowers and reuse ceremony arrangements.</li>
  <li>Host a Friday or Sunday wedding for better pricing.</li>
  <li>Swap printed programs for a single large sign.</li>
</ol>

<blockquote>
  “A great budget is one you can actually follow and enjoy.”
</blockquote>
`,
  },
  {
    id: 3,
    slug: "signature-style-moodboard",
    title: "Designing Your Signature Wedding Style (Without Overdoing It)",
    description: "Create a cohesive look that feels personal, not pinterest-perfect.",
    imageUrl: "/images/advice-ideas/post-3.webp",
    imageAlt: "Wedding moodboard with textures and color swatches",
    date: "Feb 10, 2026",
    category: "Style & Decor",
    author: "Priya Singh",
    avatarUrl: "/images/advice-ideas/avatars/3.webp",
    readTime: 9,
    featured: true,
    content: `
<h2>Choose three style words</h2>
<p>Pick three adjectives that describe the vibe you want guests to feel. Examples: romantic, modern, coastal. This becomes your filter for every decision.</p>

<h3>Build a focused moodboard</h3>
<ul>
  <li>Limit inspiration to 15 to 20 images.</li>
  <li>Include a mix of flowers, fashion, lighting, and tables.</li>
  <li>Remove anything that conflicts with your venue.</li>
</ul>

<h2>Create a balanced color palette</h2>
<p>Two main colors, one accent, and one metallic keeps everything cohesive and easy for vendors to execute.</p>

<h3>Layer texture and material</h3>
<ul>
  <li>Soft: linen, voile, or velvet.</li>
  <li>Natural: wood, greenery, or stone.</li>
  <li>Reflective: glass, candlelight, or metallic accents.</li>
</ul>

<h2>Align key design touchpoints</h2>
<ul>
  <li>Ceremony: aisle, altar, and seating layout.</li>
  <li>Reception: linens, floral centerpieces, and lighting.</li>
  <li>Stationery: invitations, place cards, and signage.</li>
</ul>

<figure>
  <img src="/images/advice-ideas/post-3.webp" alt="Wedding moodboard" />
  <figcaption>A clear moodboard keeps vendors aligned and decisions simple.</figcaption>
</figure>

<h2>Studio walkthrough</h2>
<video controls poster="/images/advice-ideas/post-4.webp">
  <source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" type="video/mp4" />
  Your browser does not support the video tag.
</video>

<h2>Use repetition to create cohesion</h2>
<p>Repeat one or two signature elements across the day. It can be a flower type, a shape, or a texture. Consistency looks intentional and elevated.</p>

<h2>Keep the look personal</h2>
<p>Pull details from your story: a shared destination, family heirloom colors, or textures from a meaningful place.</p>
`,
  },
  {
    id: 4,
    slug: "ceremony-flow-essentials",
    title: "Ceremony Flow 101: Timing, Readings, and Moments That Matter",
    description: "A simple ceremony structure that feels personal and smooth.",
    imageUrl: "/images/advice-ideas/post-4.webp",
    imageAlt: "Wedding ceremony programs and florals",
    date: "Feb 22, 2026",
    category: "Ceremony",
    author: "Maya Torres",
    avatarUrl: "/images/advice-ideas/avatars/4.webp",
    readTime: 8,
    featured: false,
    content: `
<h2>Keep the ceremony concise and meaningful</h2>
<p>A 20 to 25 minute ceremony keeps guests engaged while leaving space for the moments you care about most.</p>

<h3>Processional order</h3>
<ul>
  <li>Parents and grandparents</li>
  <li>Wedding party</li>
  <li>Partner A</li>
  <li>Partner B</li>
</ul>

<h3>Vows and readings</h3>
<p>Keep vows to a similar length so the flow feels balanced. One or two short readings add depth without slowing pace.</p>

<h2>Music cues that matter</h2>
<ul>
  <li>Pre-ceremony seating and final call</li>
  <li>Processional start and finish</li>
  <li>Vow and ring exchange underscore</li>
  <li>Recessional exit</li>
</ul>

<figure>
  <img src="/images/advice-ideas/post-4.webp" alt="Ceremony programs and florals" />
  <figcaption>Simple programs guide guests and keep the ceremony flowing.</figcaption>
</figure>

<h2>Sample ceremony script (short)</h2>
<blockquote>
  “Welcome, everyone. We are here to celebrate and witness the union of..."
</blockquote>

<h2>Rehearsal checklist</h2>
<ol>
  <li>Walk the full processional order.</li>
  <li>Practice vow placement and ring exchange.</li>
  <li>Confirm where family and VIPs will sit.</li>
</ol>

<h2>Behind-the-scenes video</h2>
<video controls poster="/images/advice-ideas/post-5.webp">
  <source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" type="video/mp4" />
  Your browser does not support the video tag.
</video>
`,
  },
  {
    id: 5,
    slug: "reception-guest-flow",
    title: "Reception Flow That Feels Effortless: From Entrances to Last Dance",
    description: "Plan the energy arc so guests know what to expect and when.",
    imageUrl: "/images/advice-ideas/post-5.webp",
    imageAlt: "Reception table settings and candles",
    date: "Mar 07, 2026",
    category: "Reception",
    author: "Chris Parker",
    avatarUrl: "/images/advice-ideas/avatars/5.webp",
    readTime: 9,
    featured: false,
    content: `
<h2>Design an energy arc</h2>
<p>Think of the reception like a story: a warm welcome, a celebratory peak, and a memorable close.</p>

<h3>Arrival and cocktail hour</h3>
<ul>
  <li>Clear signage so guests know where to go.</li>
  <li>Light appetizers and a signature drink.</li>
  <li>Background music that sets the tone.</li>
</ul>

<h3>Room reveal and entrances</h3>
<p>Give guests a moment to take in the room before seating. A short announcement or music cue creates a smooth transition.</p>

<h2>Sample reception timeline</h2>
<ol>
  <li>6:00 PM - Grand entrance</li>
  <li>6:15 PM - First dance</li>
  <li>6:30 PM - Dinner service</li>
  <li>7:15 PM - Toasts</li>
  <li>8:00 PM - Dance floor opens</li>
  <li>9:30 PM - Dessert and late-night snacks</li>
  <li>10:30 PM - Last dance and send-off</li>
</ol>

<figure>
  <img src="/images/advice-ideas/post-5.webp" alt="Reception tables with candles" />
  <figcaption>Lighting and pacing turn a reception into an experience.</figcaption>
</figure>

<h2>Reception highlight video</h2>
<video controls poster="/images/advice-ideas/post-7.webp">
  <source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" type="video/mp4" />
  Your browser does not support the video tag.
</video>

<h2>Common mistakes to avoid</h2>
<ul>
  <li>Too many formal moments back to back.</li>
  <li>Not enough time for photos during cocktail hour.</li>
  <li>Long gaps without music or announcements.</li>
</ul>
`,
  },
  {
    id: 6,
    slug: "photo-shotlist-stress-free",
    title: "A Stress-Free Wedding Photo Plan: Must-Have Shots and Buffer Time",
    description: "A practical shot list that keeps portraits relaxed and on schedule.",
    imageUrl: "/images/advice-ideas/post-6.webp",
    imageAlt: "Wedding rings and invitation suite",
    date: "Mar 21, 2026",
    category: "Photography",
    author: "Elena Rossi",
    avatarUrl: "/images/advice-ideas/avatars/6.webp",
    readTime: 9,
    featured: false,
    content: `
<h2>Start with a short must-have list</h2>
<p>Limit your must-have photos to the moments you care about most. Too many requests create stress and reduce flexibility.</p>

<h3>Detail priorities</h3>
<ul>
  <li>Rings, invitations, and heirlooms</li>
  <li>Attire details and florals</li>
  <li>Reception room before guests enter</li>
</ul>

<h2>Build time around light</h2>
<p>Ask your photographer for the best portrait window based on your season and venue. Golden hour usually needs 15 to 20 minutes.</p>

<h3>First look or no first look</h3>
<p>A first look often creates a calmer timeline and more portrait time. If you skip it, plan family formals immediately after the ceremony.</p>

<h2>Family formal list</h2>
<ul>
  <li>Couple with each immediate family</li>
  <li>Couple with grandparents</li>
  <li>Full extended family if needed</li>
</ul>

<figure>
  <img src="/images/advice-ideas/post-6.webp" alt="Rings and invitation suite" />
  <figcaption>Detail photos set the visual tone for your entire gallery.</figcaption>
</figure>

<h2>Behind the lens video</h2>
<video controls poster="/images/advice-ideas/post-1.webp">
  <source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" type="video/mp4" />
  Your browser does not support the video tag.
</video>

<h2>Buffer time saves the day</h2>
<p>Add 10 minutes between major photo segments. It keeps you from feeling rushed and lets your photographer work creatively.</p>
`,
  },
  {
    id: 7,
    slug: "guest-experience-details",
    title: "Guest Experience Wins: Thoughtful Details People Remember",
    description: "Small touches that make guests feel cared for all day long.",
    imageUrl: "/images/advice-ideas/post-7.webp",
    imageAlt: "Welcome table with wedding signage",
    date: "Apr 05, 2026",
    category: "Guest Experience",
    author: "Sam Carter",
    avatarUrl: "/images/advice-ideas/avatars/7.webp",
    readTime: 8,
    featured: false,
    content: `
<h2>Make arrival effortless</h2>
<p>Guests should know where to park, where to walk, and where to go next. Signage and a friendly greeter make a big difference.</p>

<h3>Comfort and accessibility</h3>
<ul>
  <li>Shade or heaters based on the season.</li>
  <li>Water stations throughout the event.</li>
  <li>Clear paths for anyone with mobility needs.</li>
</ul>

<h2>Food and drink flow</h2>
<p>Never let guests wonder if food is coming. Announce when stations open and keep small bites available during long gaps.</p>

<h3>Keep the timeline visible</h3>
<ul>
  <li>A welcome sign with the day schedule.</li>
  <li>Table numbers that are easy to read.</li>
  <li>Restroom and coat check directions.</li>
</ul>

<figure>
  <img src="/images/advice-ideas/post-7.webp" alt="Welcome table with signage" />
  <figcaption>Clear signage turns arrival into a smooth, relaxed experience.</figcaption>
</figure>

<h2>Guest experience reel</h2>
<video controls poster="/images/advice-ideas/post-8.webp">
  <source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" type="video/mp4" />
  Your browser does not support the video tag.
</video>

<h2>Thoughtful extras</h2>
<ul>
  <li>Welcome note or mini itinerary.</li>
  <li>Local snack or treat at the end of the night.</li>
  <li>Transportation or rideshare info.</li>
</ul>

<h2>End on a high note</h2>
<p>Late-night snacks, a final song, or a send-off moment leaves guests with a lasting memory.</p>
`,
  },
  {
    id: 8,
    slug: "modern-wedding-etiquette",
    title: "Modern Wedding Etiquette: Invites, Plus-Ones, and Boundaries",
    description: "Clear, kind communication that reduces stress for everyone.",
    imageUrl: "/images/advice-ideas/post-8.webp",
    imageAlt: "Wedding invitation suite with envelopes",
    date: "Apr 18, 2026",
    category: "Etiquette",
    author: "Noah Bennett",
    avatarUrl: "/images/advice-ideas/avatars/8.webp",
    readTime: 9,
    featured: false,
    content: `
<h2>Invitations should be unambiguous</h2>
<p>Name the invited guests on the envelope and RSVP card. Clear addressing prevents awkward misunderstandings.</p>

<h3>Plus-ones and partners</h3>
<ul>
  <li>Be consistent across your guest list.</li>
  <li>List plus-ones by name when possible.</li>
  <li>Use the website to confirm who is invited.</li>
</ul>

<h3>Children at the wedding</h3>
<p>If your event is adults-only, communicate it kindly on the website and invitations so families can plan.</p>

<h2>RSVP timing and follow-ups</h2>
<p>Set a firm RSVP date four to six weeks out. Follow up once with anyone who has not responded.</p>

<h2>Dress code and the wedding website</h2>
<ul>
  <li>Keep dress code descriptions simple and specific.</li>
  <li>Share weather tips and venue terrain details.</li>
  <li>Include transportation, parking, and timing.</li>
</ul>

<figure>
  <img src="/images/advice-ideas/post-8.webp" alt="Invitation suite" />
  <figcaption>Clear language keeps expectations kind and consistent.</figcaption>
</figure>

<h2>Etiquette essentials video</h2>
<video controls poster="/images/advice-ideas/post-3.webp">
  <source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" type="video/mp4" />
  Your browser does not support the video tag.
</video>

<h2>Setting boundaries with kindness</h2>
<p>When budgets or venue capacity are tight, clear communication is the most respectful choice. Short, calm phrasing prevents confusion and keeps the tone warm.</p>
`,
  },
];
