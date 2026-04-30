export type AdviceIdeasBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[]; ordered?: boolean }
  | { type: 'quote'; quote: string; attribution?: string }
  | { type: 'tip'; title: string; text: string }
  | { type: 'image'; src: string; alt: string; caption?: string }
  | { type: 'video'; src: string; poster?: string; alt: string; caption?: string }
  | { type: 'gallery'; items: { src: string; alt: string }[] }
  | { type: 'subheading'; text: string }

export type AdviceIdeasBodySection = {
  id: string
  label?: string
  heading: string
  blocks: AdviceIdeasBlock[]
}

export type AdviceIdeasSectionId =
  | 'featured-stories'
  | 'planning-guides'
  | 'real-weddings'
  | 'themes-styles'
  | 'etiquette-wording'
  | 'bridal-shower-ideas'
  | 'honeymoon-ideas'

export type AdviceIdeasSeedComment = {
  id: string
  name: string
  body: string
  date: string
  likes: number
}

export type AdviceIdeasPost = {
  id: string
  slug: string
  title: string
  excerpt: string
  description: string
  category: string
  sectionId: AdviceIdeasSectionId
  date: string
  readTime: string
  author: string
  authorRole: string
  featured?: boolean
  heroMedia: {
    type: 'image' | 'video'
    src: string
    alt: string
    poster?: string
  }
  body: AdviceIdeasBodySection[]
  seedComments?: AdviceIdeasSeedComment[]
}

export type AdviceIdeasTopic = {
  id: AdviceIdeasSectionId
  label: string
  description: string
}

export type AdviceIdeasNavLink = {
  label: string
  href: string
}

export type AdviceIdeasAuthor = {
  name: string
  role: string
  bio: string
  initials: string
}

export const adviceIdeasAuthors: Record<string, AdviceIdeasAuthor> = {
  'Talia M.': {
    name: 'Talia M.',
    role: 'Celebrations Editor',
    initials: 'TM',
    bio: 'Talia covers bridal showers, engagement parties, and the smaller-format celebrations that set the tone for the wedding weekend. She is interested in hosting that respects guests as much as it impresses them.',
  },
  'Nia K.': {
    name: 'Nia K.',
    role: 'Editorial Director',
    initials: 'NK',
    bio: 'Nia leads OpusFesta editorial, with a background in real-wedding storytelling and visual direction. She believes the strongest weddings are designed around how the day should feel, not how much it can fit in.',
  },
  'Amani L.': {
    name: 'Amani L.',
    role: 'Planning Editor',
    initials: 'AL',
    bio: 'Amani writes practical planning pieces grounded in years of working alongside vendors and venues across East Africa. Her guides focus on calm logistics and clear decision-making.',
  },
  'Maya B.': {
    name: 'Maya B.',
    role: 'Style Writer',
    initials: 'MB',
    bio: 'Maya covers bridal style, palette, and atmosphere. She writes about wedding aesthetics through the lens of contrast, proportion, and personality — not trends.',
  },
  'Jordan E.': {
    name: 'Jordan E.',
    role: 'Etiquette Contributor',
    initials: 'JE',
    bio: 'Jordan writes about wedding etiquette, family dynamics, and guest communication. Their work focuses on language that holds boundaries without escalating tension.',
  },
  'Lulu S.': {
    name: 'Lulu S.',
    role: 'Travel Editor',
    initials: 'LS',
    bio: 'Lulu covers honeymoons, mini-moons, and destination weddings, with a soft spot for trips that prioritise rest as much as adventure.',
  },
}

export function getAuthor(name: string): AdviceIdeasAuthor {
  return (
    adviceIdeasAuthors[name] ?? {
      name,
      role: '',
      initials: name
        .split(' ')
        .map((p) => p[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase(),
      bio: '',
    }
  )
}

export const ADVICE_IDEAS_BASE_PATH = '/advice-and-ideas'

// Thumbnail source for any post — falls back to the video poster image
// for posts where the hero is an `.mov` / `.mp4`. next/image can't render
// a video file, so cards need to reach for the poster jpg instead.
export function heroThumb(post: { heroMedia: { type: 'image' | 'video'; src: string; poster?: string } }): string {
  if (post.heroMedia.type === 'video' && post.heroMedia.poster) {
    return post.heroMedia.poster
  }
  return post.heroMedia.src
}

export const adviceIdeasTopics: AdviceIdeasTopic[] = [
  {
    id: 'featured-stories',
    label: 'Featured Stories',
    description: 'Editor picks, sharp ideas, and standout inspiration.',
  },
  {
    id: 'planning-guides',
    label: 'Planning Guides',
    description: 'Timelines, vendor strategy, and practical decision making.',
  },
  {
    id: 'real-weddings',
    label: 'Real Weddings',
    description: 'Celebrations that feel personal, stylish, and deeply local.',
  },
  {
    id: 'themes-styles',
    label: 'Themes & Styles',
    description: 'Moodboards, palettes, looks, and atmosphere.',
  },
  {
    id: 'etiquette-wording',
    label: 'Etiquette & Wording',
    description: 'Guest communication, boundaries, and graceful scripts.',
  },
  {
    id: 'bridal-shower-ideas',
    label: 'Bridal Shower Ideas',
    description: 'Modern ways to host pre-wedding celebrations.',
  },
  {
    id: 'honeymoon-ideas',
    label: 'Honeymoon Ideas',
    description: 'Escapes, soft landings, and memorable mini-moons.',
  },
]

export const adviceIdeasPosts: AdviceIdeasPost[] = [
  {
    id: 'zanzibar-sunset-wedding',
    slug: 'zanzibar-sunset-wedding',
    title: 'Inside A Zanzibar Sunset Wedding That Felt Warm, Cinematic, And Effortless',
    excerpt:
      'A real wedding with candlelit details, soft tailoring, and a guest experience that stayed elegant without becoming overly formal.',
    description:
      'A real wedding story about pacing, mood, and details that made a coastal celebration feel intentional from start to finish.',
    category: 'Real Weddings',
    sectionId: 'real-weddings',
    date: 'April 1, 2026',
    readTime: '6 min read',
    author: 'Nia K.',
    authorRole: 'Editorial Director',
    featured: true,
    heroMedia: {
      type: 'image',
      src: '/assets/images/coupleswithpiano.jpg',
      alt: 'Couple embracing during a romantic wedding portrait',
    },
    body: [
      {
        id: 'story-overview',
        label: 'The Mood',
        heading: 'A soft, high-contrast celebration with room to breathe',
        blocks: [
          {
            type: 'paragraph',
            text: 'The couple wanted something polished but not stiff. Their brief centered on warm light, elegant tailoring, gentle florals, and a schedule that left enough room for actual conversation.',
          },
          {
            type: 'paragraph',
            text: 'Instead of stacking the day with moments, they focused on fewer scenes with stronger atmosphere: one dramatic ceremony view, one deeply personal dinner setup, and one dance floor that opened late but landed hard.',
          },
          {
            type: 'quote',
            quote: 'We stopped trying to impress everyone and started designing for how we wanted the day to feel.',
            attribution: 'The bride',
          },
        ],
      },
      {
        id: 'design-details',
        label: 'What Worked',
        heading: 'Three design decisions made the whole event feel elevated',
        blocks: [
          {
            type: 'list',
            items: [
              'A narrowed palette of black, ivory, blush, and amber kept every detail coherent.',
              'Statement lighting did more than the florals in the evening and changed the mood instantly.',
              'A shorter cocktail hour kept dinner on time and preserved energy for the reception.',
            ],
          },
          {
            type: 'tip',
            title: 'Editorial takeaway',
            text: 'When a venue already has character, use styling to sharpen it rather than compete with it.',
          },
        ],
      },
      {
        id: 'guest-experience',
        label: 'Guest Experience',
        heading: 'The pacing felt generous without ever dragging',
        blocks: [
          {
            type: 'paragraph',
            text: 'Guests always knew what came next. Signage was minimal but strategic, welcome drinks appeared exactly where they were needed, and the dinner transition was fast enough that nobody lost momentum.',
          },
          {
            type: 'paragraph',
            text: 'The result was a wedding that looked beautiful in photos but felt even stronger in person because it respected everyone’s attention.',
          },
        ],
      },
    ],
  },
  {
    id: 'twelve-month-wedding-plan',
    slug: 'twelve-month-wedding-plan',
    title: 'A Twelve-Month Wedding Plan That Keeps The Stress Down And The Priorities Clear',
    excerpt:
      'A realistic month-by-month framework for couples who want structure without turning the process into a second job.',
    description:
      'A practical planning guide that maps the year, protects your energy, and keeps decisions tied to what matters most.',
    category: 'Planning Guides',
    sectionId: 'planning-guides',
    date: 'March 28, 2026',
    readTime: '8 min read',
    author: 'Amani L.',
    authorRole: 'Planning Editor',
    featured: true,
    heroMedia: {
      type: 'image',
      src: '/assets/images/brideincar.jpg',
      alt: 'Bride in a car on the way to a wedding celebration',
    },
    body: [
      {
        id: 'set-the-frame',
        label: 'Month 12 To 9',
        heading: 'Start with the decisions that move everything else',
        blocks: [
          {
            type: 'paragraph',
            text: 'Guest count, budget range, and date flexibility shape nearly every major choice. Lock those three before you obsess over colors, tableware, or content ideas.',
          },
          {
            type: 'list',
            items: [
              'Confirm budget ceiling and contingency.',
              'Shortlist venues that actually match the guest count.',
              'Book the vendors that are hardest to replace: venue, planner, photo, video.',
            ],
          },
        ],
      },
      {
        id: 'build-the-middle',
        label: 'Month 8 To 4',
        heading: 'Use the middle stretch to turn vibe into real logistics',
        blocks: [
          {
            type: 'paragraph',
            text: 'This is where design direction and real-world operations need to meet. Your palette, menu, music, travel information, and wardrobe should start talking to one another instead of living in separate tabs.',
          },
          {
            type: 'tip',
            title: 'Useful rule',
            text: 'If a choice does not improve atmosphere, comfort, or clarity, it probably does not deserve budget priority.',
          },
        ],
      },
      {
        id: 'protect-the-final-month',
        label: 'Final 30 Days',
        heading: 'The last month is for confirmation, not invention',
        blocks: [
          {
            type: 'list',
            items: [
              'Finalize timings and send one clean schedule to everyone.',
              'Reduce open decisions to almost zero.',
              'Delegate guest questions and vendor check-ins to one trusted person.',
            ],
          },
          {
            type: 'quote',
            quote: 'The calmest weddings usually come from fewer last-minute ideas, not better last-minute ideas.',
            attribution: 'OpusFesta planning team',
          },
        ],
      },
    ],
  },
  {
    id: 'garden-party-style-notes',
    slug: 'garden-party-style-notes',
    title: 'Garden Party Style Notes For Couples Who Want Romance Without The Clichés',
    excerpt:
      'A moodboard-led approach to creating softness, shape, and personality without falling into a generic pastel wedding.',
    description:
      'A style story about building a wedding aesthetic through contrast, proportion, and a lighter but still deliberate palette.',
    category: 'Themes & Styles',
    sectionId: 'themes-styles',
    date: 'March 20, 2026',
    readTime: '5 min read',
    author: 'Maya B.',
    authorRole: 'Style Writer',
    featured: true,
    heroMedia: {
      type: 'image',
      src: '/assets/images/flowers_pinky.jpg',
      alt: 'Pink floral arrangement styled for a wedding moodboard',
    },
    body: [
      {
        id: 'start-with-texture',
        label: 'Palette',
        heading: 'Texture is what keeps a light palette from feeling flat',
        blocks: [
          {
            type: 'paragraph',
            text: 'If your color story leans soft, the real work comes from material. Glossy ribbons, matte paper, structured tailoring, raw-edge florals, and warm wood details create the contrast your eye needs.',
          },
          {
            type: 'list',
            items: [
              'Use one vivid tone as a punctuation mark, not a full-system color.',
              'Let white and black behave like styling anchors, not afterthoughts.',
              'Choose one floral shape to repeat across the ceremony and dinner.',
            ],
          },
        ],
      },
      {
        id: 'dress-the-space',
        label: 'Atmosphere',
        heading: 'A good moodboard should tell you how the room feels at sunset',
        blocks: [
          {
            type: 'paragraph',
            text: 'The strongest garden-party weddings are less about being “pretty” and more about how they hold the transition from daylight to evening. Build for that shift early.',
          },
          {
            type: 'quote',
            quote: 'Style is strongest when every choice agrees on the same temperature.',
            attribution: 'Maya B.',
          },
        ],
      },
    ],
  },
  {
    id: 'guest-list-boundaries-script',
    slug: 'guest-list-boundaries-script',
    title: 'Guest List Boundaries: The Scripts That Keep Family Conversations Calm',
    excerpt:
      'A direct but kind framework for handling pressure, plus-ones, parents’ requests, and unspoken assumptions.',
    description:
      'An etiquette and wording guide for couples who need firmer boundaries without escalating the emotional temperature.',
    category: 'Etiquette & Wording',
    sectionId: 'etiquette-wording',
    date: 'March 15, 2026',
    readTime: '7 min read',
    author: 'Jordan E.',
    authorRole: 'Etiquette Contributor',
    heroMedia: {
      type: 'image',
      src: '/assets/images/authentic_couple.jpg',
      alt: 'Couple holding hands in an intimate candid moment',
    },
    body: [
      {
        id: 'frame-the-rule',
        label: 'The Principle',
        heading: 'Boundaries land better when they sound like policy, not emotion',
        blocks: [
          {
            type: 'paragraph',
            text: 'People push hardest when they think the rule is personal. The fastest way to lower heat is to turn a difficult answer into a clear event rule applied consistently to everyone.',
          },
          {
            type: 'tip',
            title: 'Useful phrasing',
            text: 'We are keeping the guest list tight, so we are only inviting people we know personally and have space planned for.',
          },
        ],
      },
      {
        id: 'common-pressure-points',
        label: 'Pressure Points',
        heading: 'Three moments that usually need a script',
        blocks: [
          {
            type: 'list',
            items: [
              'Requests for extra family invites after the list is already balanced.',
              'Assumptions that every invitation includes a plus-one.',
              'Pressure to invite people out of obligation rather than closeness.',
            ],
          },
          {
            type: 'paragraph',
            text: 'Short answers work better than defensive ones. Once you start over-explaining, people hear the gap instead of the boundary.',
          },
        ],
      },
      {
        id: 'how-to-close',
        label: 'Close Gracefully',
        heading: 'End the conversation without reopening the decision',
        blocks: [
          {
            type: 'quote',
            quote: 'Thanks for understanding. We are sticking with the plan we set so we can keep things manageable.',
          },
          {
            type: 'paragraph',
            text: 'The goal is not to win the conversation. The goal is to stop renegotiating the wedding every week.',
          },
        ],
      },
    ],
  },
  {
    id: 'bridal-shower-weekend-guide',
    slug: 'bridal-shower-weekend-guide',
    title: 'A Bridal Shower Weekend That Feels Current, Personal, And Actually Fun',
    excerpt:
      'A modern hosting blueprint that replaces awkward games and overdecorated tables with energy, style, and thoughtful pacing.',
    description:
      'A celebration guide for bridal showers and pre-wedding gatherings that feel social, polished, and easy to host.',
    category: 'Bridal Shower Ideas',
    sectionId: 'bridal-shower-ideas',
    date: 'March 8, 2026',
    readTime: '11 min read',
    author: 'Talia M.',
    authorRole: 'Celebrations Editor',
    heroMedia: {
      type: 'image',
      src: '/assets/images/mauzo_crew.jpg',
      alt: 'Friends gathered at a stylish celebration',
    },
    seedComments: [
      {
        id: 'seed-1',
        name: 'Anisa M.',
        body: 'The bit about two zones changed how I am thinking about my sister\'s shower next month. We were going to do one long table and now I am rethinking everything.',
        date: '2 days ago',
        likes: 8,
      },
      {
        id: 'seed-2',
        name: 'Lulu K.',
        body: 'A four-hour shower is genuinely the move. We tried six and the energy completely flattened around hour four. Will not make that mistake again.',
        date: '5 days ago',
        likes: 12,
      },
      {
        id: 'seed-3',
        name: 'Joyce W.',
        body: 'Loved the part about modular decor. Saved this one to send to my planner.',
        date: '1 week ago',
        likes: 4,
      },
    ],
    body: [
      {
        id: 'set-the-tone',
        label: 'Hosting',
        heading: 'Start by deciding whether the energy should feel loungey, playful, or polished',
        blocks: [
          {
            type: 'paragraph',
            text: 'A shower feels modern when it behaves like a strong small event, not a template. The fastest way to make every other decision easier is to pick one tone early and let it govern food, music, seating, and lighting. When those four things agree on the same temperature, the room feels intentional even before guests arrive.',
          },
          {
            type: 'paragraph',
            text: 'A useful test: imagine the photograph you want from the middle of the afternoon. If it is people leaning in to laugh on a low couch, you are hosting loungey. If it is hands raised mid-game with bright colour everywhere, you are hosting playful. If it is a long table with structured florals and tailored outfits, you are hosting polished. Pick one. Let the rest follow.',
          },
          {
            type: 'list',
            items: [
              'Build the plan around one strong shared activity rather than a packed schedule.',
              'Keep decor modular so the room still feels breathable and easy to photograph.',
              'Use food and drinks to create rhythm rather than just volume.',
              'Cap the guest count at the number that fits the largest seating zone comfortably.',
            ],
          },
          {
            type: 'tip',
            title: 'Useful framing',
            text: 'A shower that knows its tone usually feels half an hour shorter than its actual runtime. A shower without a tone usually feels twice as long.',
          },
        ],
      },
      {
        id: 'design-the-space',
        label: 'The Room',
        heading: 'Design the room around two strong zones, not one busy table',
        blocks: [
          {
            type: 'paragraph',
            text: 'Most modern showers work better when the room reads as two distinct zones: a soft anchor (low couches, throws, side tables, tray of drinks) and an upright anchor (a high table, cocktail bar, or styled snack station). Guests rotate between them naturally, and the room never empties out at one end.',
          },
          {
            type: 'image',
            src: '/assets/images/flowers_pinky.jpg',
            alt: 'Soft pink floral arrangement on a styled side table',
            caption:
              'A short, dense floral works harder than a long centerpiece — it leaves room for plates, glasses, and elbows.',
          },
          {
            type: 'paragraph',
            text: 'Once the two zones exist, light them differently. Warm, low lamps for the soft zone. Crisper overhead or directional light for the upright zone. The contrast does most of the styling work for you and gives the room a built-in second act when daylight starts to drop.',
          },
          {
            type: 'list',
            items: [
              'Pick one fabric texture (linen, raw silk, brushed cotton) and repeat it across napkins, throws, and table runners.',
              'Limit florals to two shapes: one short and dense, one tall and architectural.',
              'Keep the colour story to three tones plus white, and skip metallic accents unless they are intentional.',
            ],
          },
        ],
      },
      {
        id: 'food-and-drink',
        label: 'Food & Drink',
        heading: 'Build the menu to be photographed and grazed at, not served',
        blocks: [
          {
            type: 'paragraph',
            text: 'Plated meals slow a shower down. The strongest format is a continuous graze — small dishes that arrive and refresh in waves, paired with two or three signature drinks that guests can pour themselves. Nobody waits for a course to start. Nobody is stuck in line for ten minutes.',
          },
          {
            type: 'paragraph',
            text: 'Pick your dishes by colour and shape, not just flavour. A platter that photographs well is doing double duty. And keep at least one item warm at any moment — even at a graze, the warm bite is what tells your nose this is a real event and not just snacks.',
          },
          {
            type: 'tip',
            title: 'Drink rule',
            text: 'Two signature cocktails (one bright, one mellow), one zero-proof option that feels intentional, sparkling water in a beautiful pitcher. That is enough. A full open bar at a bridal shower almost always slows the room down.',
          },
          {
            type: 'image',
            src: '/assets/images/coupleswithpiano.jpg',
            alt: 'Couple in a styled celebration setting with soft natural light',
            caption:
              'Natural light is the cheapest upgrade you can give the food table. Position it within two metres of a window if you can.',
          },
        ],
      },
      {
        id: 'one-shared-moment',
        label: 'The Activity',
        heading: 'Choose one shared moment that people will actually talk about later',
        blocks: [
          {
            type: 'paragraph',
            text: 'You do not need ten games to create momentum. You need one well-designed moment that gets every guest involved for fifteen to twenty minutes, and then quietly returns the room to conversation. The best ones are slightly creative, slightly nostalgic, and easy to opt into without performing.',
          },
          {
            type: 'list',
            ordered: true,
            items: [
              'A guided memory wall: each guest writes one short memory on a card and pins it to a board. Read three at random near the end of the shower.',
              'A pour-and-pair tasting: small flights of two drinks (or chocolates, or olive oils) with a one-line pairing prompt on each card. People talk to whoever is closest.',
              'A scent or fragrance station: three to four samples laid out, guests vote on which one most matches the bride. Easy to host, surprisingly memorable.',
              'A short collaborative playlist: each guest adds one song before the music switches over. Then play it through dinner.',
            ],
          },
          {
            type: 'video',
            src: '/assets/videos/happy_couples.mov',
            poster: '/assets/images/beautiful_bride.jpg',
            alt: 'Friends celebrating together in soft, natural light',
            caption:
              'The strongest activities create their own footage. You barely have to direct people.',
          },
          {
            type: 'paragraph',
            text: 'After the activity ends, leave forty-five minutes of completely unstructured time. That is when the real conversations happen. If you cram another moment in immediately, you flatten the one you just designed.',
          },
        ],
      },
      {
        id: 'guest-experience',
        label: 'Guest Experience',
        heading: 'The small details that make guests feel hosted, not just invited',
        blocks: [
          {
            type: 'paragraph',
            text: 'Hosting is mostly small relief. A coat rack right at the door so nobody is holding a jacket awkwardly. A tray of welcome drinks within three steps of the entrance. A clear sign for the bathroom on the way to the kitchen. None of these will make the photographs, but every one of them will be felt.',
          },
          {
            type: 'list',
            items: [
              'Greet every guest within sixty seconds of arrival, even if it is only a wave from across the room.',
              'Have a designated friend (not the bride, not the host) on light rotation watching for empty glasses.',
              'Keep one quiet corner intentionally undecorated so guests can step out of the energy without leaving.',
              'Park a small basket of practical things (hair ties, blotting tissues, a phone charger, a sewing kit) in the bathroom.',
            ],
          },
          {
            type: 'quote',
            quote: 'A room that lets guests settle is almost always more stylish than one that performs every minute.',
          },
        ],
      },
      {
        id: 'pacing-the-afternoon',
        label: 'Pacing',
        heading: 'A four-hour shower is almost always better than a six-hour one',
        blocks: [
          {
            type: 'paragraph',
            text: 'The most common mistake is overrunning the schedule by two hours and assuming the energy will hold. It will not. The room peaks somewhere between hour two and hour three, and after that you are negotiating with a slowly emptying floor. Plan a true end time, signal it gently, and let the close feel chosen rather than abandoned.',
          },
          {
            type: 'subheading',
            text: 'A simple four-hour template',
          },
          {
            type: 'list',
            ordered: true,
            items: [
              'Hour 1 — arrivals, welcome drinks, soft music, low light. No pressure.',
              'Hour 2 — graze opens, music lifts a notch, the bride circulates instead of being seated.',
              'Hour 3 — the shared activity, then a short toast. This is the photographable middle.',
              'Hour 4 — open conversation, dessert and coffee, music drops back to soft. Doors close warmly on time.',
            ],
          },
          {
            type: 'tip',
            title: 'Closing detail',
            text: 'Hand each guest one small item on the way out — a printed song from the playlist, a single chocolate, a folded note from the bride. People remember the last thirty seconds of an event more than the first thirty.',
          },
        ],
      },
      {
        id: 'what-to-cut',
        label: 'What To Cut',
        heading: 'The things that almost never improve a modern shower',
        blocks: [
          {
            type: 'paragraph',
            text: 'A few categories of decisions still get carried over from older shower templates and almost never make the celebration stronger. Cutting them frees budget and energy for the things that do.',
          },
          {
            type: 'list',
            items: [
              'Multiple themed games stacked back to back — pick one shared moment and protect it.',
              'Oversized balloon installations that block sightlines across the room.',
              'A formal seating chart for a four-hour graze — let people drift.',
              'Long opening speeches before guests have a drink in hand.',
              'Favours that nobody actually takes home — a single thoughtful item beats a goody bag.',
            ],
          },
          {
            type: 'paragraph',
            text: 'The best showers usually look slightly underplanned compared to what you imagined and feel exactly right in the room. Trust the editing. The bride will remember the temperature of the afternoon, not the count of activities you fit into it.',
          },
        ],
      },
    ],
  },
  {
    id: 'invitation-wording-that-sounds-like-you',
    slug: 'invitation-wording-that-sounds-like-you',
    title: 'Invitation Wording That Feels Warm, Clear, And Still Sounds Like You',
    excerpt:
      'A modern etiquette guide for invitation lines, host mentions, dress code notes, and RSVP language without stiff template energy.',
    description:
      'A wording guide that helps couples write invitations and guest-facing details with more clarity, personality, and less borrowed formal language.',
    category: 'Etiquette & Wording',
    sectionId: 'etiquette-wording',
    date: 'March 11, 2026',
    readTime: '5 min read',
    author: 'Jordan E.',
    authorRole: 'Etiquette Contributor',
    heroMedia: {
      type: 'image',
      src: '/assets/images/hand_rings.jpg',
      alt: 'Close-up of hands and rings styled like an invitation detail still life',
    },
    body: [
      {
        id: 'start-with-tone',
        label: 'Tone',
        heading: 'The best wording sounds composed, not borrowed',
        blocks: [
          {
            type: 'paragraph',
            text: 'Most invitation language gets awkward when couples try to sound more formal than they actually are. A cleaner sentence with strong spacing and good typography will usually land better than decorative phrasing.',
          },
          {
            type: 'list',
            items: [
              'Keep the invitation line direct and easy to read aloud.',
              'Use the details card for logistics instead of crowding the main invitation.',
              'Choose one tone and keep it across save-the-dates, website copy, and signage.',
            ],
          },
        ],
      },
      {
        id: 'useful-lines',
        label: 'Examples',
        heading: 'Guest clarity matters more than sounding ceremonial',
        blocks: [
          {
            type: 'tip',
            title: 'Useful line',
            text: 'Dinner and dancing to follow works because it is warm, clear, and does not overperform.',
          },
          {
            type: 'quote',
            quote: 'Good wording should sound like the couple, not like a template trying too hard to feel expensive.',
          },
        ],
      },
    ],
  },
  {
    id: 'weekend-guest-communication',
    slug: 'weekend-guest-communication',
    title: 'How To Keep Weekend Guest Communication Calm, Useful, And Not Overwritten',
    excerpt:
      'A better structure for wedding websites, WhatsApp updates, welcome notes, and last-minute reminders so guests stay informed without feeling spammed.',
    description:
      'An etiquette guide for guest messaging that keeps the tone warm while cutting repetition, confusion, and day-of noise.',
    category: 'Etiquette & Wording',
    sectionId: 'etiquette-wording',
    date: 'March 6, 2026',
    readTime: '4 min read',
    author: 'Jordan E.',
    authorRole: 'Etiquette Contributor',
    heroMedia: {
      type: 'image',
      src: '/assets/images/churchcouples.jpg',
      alt: 'Guests gathering at a wedding venue entrance',
    },
    body: [
      {
        id: 'what-guests-need',
        label: 'Guest Messaging',
        heading: 'Send fewer updates, but make each one actually useful',
        blocks: [
          {
            type: 'paragraph',
            text: 'Guests do not need a running commentary. They need the right information at the right time: schedule, location, transport, dress code, and one contact person for last-minute questions.',
          },
          {
            type: 'list',
            items: [
              'Put evergreen information on the website first.',
              'Use text messages only for changes or same-day essentials.',
              'Name one coordination contact so couples are not fielding every question personally.',
            ],
          },
        ],
      },
      {
        id: 'keep-it-light',
        label: 'Practical Rule',
        heading: 'Friendly beats overexplained every time',
        blocks: [
          {
            type: 'quote',
            quote: 'If a guest has to read the message twice, the wording is probably doing too much.',
          },
        ],
      },
    ],
  },
  {
    id: 'honeymoon-week-in-zanzibar',
    slug: 'honeymoon-week-in-zanzibar',
    title: 'How To Plan A One-Week Zanzibar Honeymoon That Feels Restful, Not Rushed',
    excerpt:
      'A simple itinerary strategy for couples who want romance, slowness, and enough structure to avoid decision fatigue.',
    description:
      'A honeymoon guide focused on pacing, layering locations, and making a shorter trip feel memorable instead of compressed.',
    category: 'Honeymoon Ideas',
    sectionId: 'honeymoon-ideas',
    date: 'March 3, 2026',
    readTime: '6 min read',
    author: 'Lulu S.',
    authorRole: 'Travel Editor',
    heroMedia: {
      type: 'image',
      src: '/assets/images/bride_umbrella.jpg',
      alt: 'Bride holding an umbrella in a breezy romantic setting',
    },
    body: [
      {
        id: 'pace-the-trip',
        label: 'Itinerary',
        heading: 'Two zones are usually enough for a seven-day honeymoon',
        blocks: [
          {
            type: 'paragraph',
            text: 'Trying to “see everything” in one week turns a honeymoon into logistics. Most couples get a better experience by pairing one culture-forward stop with one slower beachfront stay.',
          },
          {
            type: 'list',
            items: [
              'Start with Stone Town for one or two nights.',
              'Move once into your beach stay and let the rest unfold gently.',
              'Leave at least one full day with no bookings at all.',
            ],
          },
        ],
      },
      {
        id: 'protect-your-energy',
        label: 'Trip Design',
        heading: 'Build around how you want to feel, not how much you can fit',
        blocks: [
          {
            type: 'tip',
            title: 'Good honeymoon math',
            text: 'One meaningful dinner, one memorable excursion, one long empty afternoon. Repeat as needed.',
          },
          {
            type: 'paragraph',
            text: 'You are designing recovery as much as adventure. A slightly quieter itinerary often creates the stronger memory.',
          },
        ],
      },
    ],
  },
  {
    id: 'vendor-meeting-questions',
    slug: 'vendor-meeting-questions',
    title: 'The Vendor Meeting Questions That Reveal Whether A Team Can Actually Deliver',
    excerpt:
      'A sharper set of questions for planners, photographers, florists, and caterers that gets past polished portfolios fast.',
    description:
      'A planning guide that helps couples evaluate vendor fit through process, responsiveness, and day-of thinking rather than just aesthetics.',
    category: 'Planning Guides',
    sectionId: 'planning-guides',
    date: 'February 26, 2026',
    readTime: '6 min read',
    author: 'Amani L.',
    authorRole: 'Planning Editor',
    heroMedia: {
      type: 'video',
      src: '/assets/videos/happy_couples.mov',
      poster: '/assets/images/beautiful_bride.jpg',
      alt: 'Celebration video still of a happy couple',
    },
    body: [
      {
        id: 'ask-about-process',
        label: 'Process',
        heading: 'The strongest questions are about how someone works under pressure',
        blocks: [
          {
            type: 'paragraph',
            text: 'Portfolios tell you taste. Process tells you reliability. Ask how they build timelines, handle delays, coordinate with other vendors, and communicate when the plan changes.',
          },
          {
            type: 'list',
            items: [
              'What does your prep process look like in the final month?',
              'How do you handle a delayed timeline or weather shift?',
              'What do you need from us to do your best work?',
            ],
          },
        ],
      },
      {
        id: 'look-for-fit',
        label: 'Fit',
        heading: 'Calm communication is part of the service',
        blocks: [
          {
            type: 'paragraph',
            text: 'If a vendor answers clearly, stays specific, and talks in contingencies instead of vague promises, that usually translates well on the wedding day.',
          },
          {
            type: 'quote',
            quote: 'Great vendors do not just create beauty. They reduce chaos.',
          },
        ],
      },
    ],
  },
  {
    id: 'after-party-fashion-switch',
    slug: 'after-party-fashion-switch',
    title: 'The After-Party Fashion Switch: How To Keep The Second Look Sharp And Useful',
    excerpt:
      'A practical style note on choosing a second look that actually improves movement, comfort, and energy late into the night.',
    description:
      'A style guide to second looks, late-night outfit changes, and why function matters as much as visual drama.',
    category: 'Themes & Styles',
    sectionId: 'themes-styles',
    date: 'February 18, 2026',
    readTime: '4 min read',
    author: 'Maya B.',
    authorRole: 'Style Writer',
    heroMedia: {
      type: 'image',
      src: '/assets/images/beautiful_bride.jpg',
      alt: 'Bride portrait showing a sharp fashion-forward look',
    },
    body: [
      {
        id: 'why-switch',
        label: 'Second Look',
        heading: 'A second outfit should change how the night feels, not just how it photographs',
        blocks: [
          {
            type: 'paragraph',
            text: 'The best fashion switch solves a problem. It frees movement, cools you down, or sharpens the energy once dinner turns into dancing.',
          },
          {
            type: 'list',
            items: [
              'Shorter hemlines help if the dance floor is a major part of the night.',
              'Cleaner silhouettes usually read stronger in low evening light.',
              'Keep one visual link to the ceremony look so it still feels like the same wedding.',
            ],
          },
        ],
      },
      {
        id: 'keep-it-purposeful',
        label: 'Styling',
        heading: 'Style the switch around comfort, not only surprise',
        blocks: [
          {
            type: 'tip',
            title: 'Simple rule',
            text: 'If you cannot sit, dance, and walk quickly in it, the outfit is probably performing too hard.',
          },
        ],
      },
    ],
  },
]

export function getAdviceIdeasHref(slug: string) {
  return `${ADVICE_IDEAS_BASE_PATH}/${slug}`
}

export function getAdviceIdeasPost(slug: string) {
  return adviceIdeasPosts.find((post) => post.slug === slug)
}

export function getAdviceIdeasPostsBySection(sectionId: AdviceIdeasSectionId) {
  return adviceIdeasPosts.filter((post) => post.sectionId === sectionId)
}

export function getAdviceIdeasSectionHref(sectionId: AdviceIdeasSectionId) {
  return `${ADVICE_IDEAS_BASE_PATH}#${sectionId}`
}

export const adviceIdeasFooterLinks: AdviceIdeasNavLink[] = [
  { label: 'Real Weddings', href: getAdviceIdeasSectionHref('real-weddings') },
  { label: 'Planning Guides', href: getAdviceIdeasSectionHref('planning-guides') },
  { label: 'Themes & Styles', href: getAdviceIdeasSectionHref('themes-styles') },
  { label: 'Etiquette & Wording', href: getAdviceIdeasSectionHref('etiquette-wording') },
  { label: 'Bridal Shower Ideas', href: getAdviceIdeasSectionHref('bridal-shower-ideas') },
  { label: 'Honeymoon Ideas', href: getAdviceIdeasSectionHref('honeymoon-ideas') },
]

export const adviceIdeasNavLinks: AdviceIdeasNavLink[] = [
  { label: 'Real Weddings', href: getAdviceIdeasSectionHref('real-weddings') },
  { label: 'Themes & Styles', href: getAdviceIdeasSectionHref('themes-styles') },
  { label: 'Photo & Video Ideas', href: getAdviceIdeasHref('zanzibar-sunset-wedding') },
  { label: 'Honeymoon Ideas', href: getAdviceIdeasSectionHref('honeymoon-ideas') },
  { label: 'Destination Weddings', href: getAdviceIdeasHref('honeymoon-week-in-zanzibar') },
  { label: 'Planning Guides', href: getAdviceIdeasSectionHref('planning-guides') },
  { label: 'Etiquette & Wording', href: getAdviceIdeasSectionHref('etiquette-wording') },
  { label: 'For Families & Guests', href: getAdviceIdeasHref('guest-list-boundaries-script') },
  { label: 'Bridal Shower Ideas', href: getAdviceIdeasSectionHref('bridal-shower-ideas') },
  { label: 'Engagement Party Tips', href: getAdviceIdeasHref('bridal-shower-weekend-guide') },
]
