export interface AdviceIdeaPost {
  slug: string;
  title: string;
  excerpt: string | null;
  category: string | null;
  hero_media_src: string | null;
  read_time: number | null;
  featured: boolean;
}

export interface AdviceIdeaRichSpan {
  text: string;
  type: 'text';
  marks?: { type: 'bold' | 'italic' }[];
}

export interface AdviceIdeaParagraphBlock {
  type: 'paragraph';
  text: string;
  richText?: AdviceIdeaRichSpan[];
}

export interface AdviceIdeaImageBlock {
  type: 'image';
  src: string;
  alt?: string;
}

export interface AdviceIdeaListBlock {
  type: 'list';
  ordered: boolean;
  items: string[];
}

export type AdviceIdeaBlock =
  | AdviceIdeaParagraphBlock
  | AdviceIdeaImageBlock
  | AdviceIdeaListBlock;

export interface AdviceIdeaSection {
  id: string;
  heading: string;
  blocks: AdviceIdeaBlock[];
}

export interface AdviceIdeaPostDetail extends AdviceIdeaPost {
  author_name: string | null;
  /** Real data is sparse — `advice_ideas_authors` (the bio/avatar table the
   * web app joins against) has zero rows as of writing, and only 1 of 18
   * published posts has a non-null `author_avatar_url`. Render gracefully
   * when absent (initials fallback), don't assume it's always populated. */
  author_role: string | null;
  author_avatar_url: string | null;
  body: AdviceIdeaSection[];
}
