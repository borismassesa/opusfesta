export interface Quote {
  text: string;
  author: string;
}

// Quotes for Sign In page - focused on returning, coming back, welcome back themes
export const signInQuotes: Quote[] = [
  {
    text: "The highest happiness on earth is the happiness of marriage.",
    author: "William Lyon Phelps",
  },
  {
    text: "A successful marriage requires falling in love many times, always with the same person.",
    author: "Mignon McLaughlin",
  },
  {
    text: "The best thing to hold onto in life is each other.",
    author: "Audrey Hepburn",
  },
  {
    text: "Being deeply loved by someone gives you strength, while loving someone deeply gives you courage.",
    author: "Lao Tzu",
  },
  {
    text: "A happy marriage is a long conversation which always seems too short.",
    author: "André Maurois",
  },
  {
    text: "In all the world, there is no heart for me like yours. In all the world, there is no love for you like mine.",
    author: "Maya Angelou",
  },
  {
    text: "Love is not about how many days, months, or years you have been together. It's about how much you love each other every single day.",
    author: "Unknown",
  },
  {
    text: "The secret of a happy marriage is finding the right person. You know they're right if you love to be with them all the time.",
    author: "Julia Child",
  },
];

// Quotes for Sign Up page - focused on new beginnings, starting, planning themes
export const signUpQuotes: Quote[] = [
  {
    text: "Every love story is beautiful, but ours is my favorite.",
    author: "Unknown",
  },
  {
    text: "Marriage is not a noun; it's a verb. It isn't something you get. It's something you do.",
    author: "Barbara De Angelis",
  },
  {
    text: "A great marriage is not when the 'perfect couple' comes together. It is when an imperfect couple learns to enjoy their differences.",
    author: "Dave Meurer",
  },
  {
    text: "Love is composed of a single soul inhabiting two bodies.",
    author: "Aristotle",
  },
  {
    text: "Marriage is a mosaic you build with your spouse. Millions of tiny moments that create your love story.",
    author: "Jennifer Smith",
  },
  {
    text: "The best love is the kind that awakens the soul and makes us reach for more, that plants a fire in our hearts and brings peace to our minds.",
    author: "Nicholas Sparks",
  },
  {
    text: "A wedding is a celebration of love, commitment, and the beautiful journey ahead.",
    author: "Unknown",
  },
  {
    text: "Today is the beginning of forever. Let's make it beautiful.",
    author: "Unknown",
  },
  {
    text: "Two souls, one heart, one beautiful journey together.",
    author: "Unknown",
  },
  {
    text: "The best is yet to come. Let's start this adventure together.",
    author: "Unknown",
  },
];

/**
 * Get a random quote from the sign in collection
 */
export function getRandomSignInQuote(): Quote {
  const randomIndex = Math.floor(Math.random() * signInQuotes.length);
  return signInQuotes[randomIndex];
}

/**
 * Get a random quote from the sign up collection
 */
export function getRandomSignUpQuote(): Quote {
  const randomIndex = Math.floor(Math.random() * signUpQuotes.length);
  return signUpQuotes[randomIndex];
}

/**
 * Get a random quote (deprecated - use getRandomSignInQuote or getRandomSignUpQuote instead)
 */
export function getRandomQuote(): Quote {
  return getRandomSignInQuote();
}
