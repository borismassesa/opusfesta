import { createSupabaseServerClient } from '@/lib/supabase'

export type AttireBlogArticle = { id: string; tag: string; title: string; excerpt: string; img: string }
export type AttireBlogContent = { heading: string; articles: AttireBlogArticle[] }

export const ATTIRE_BLOG_FALLBACK: AttireBlogContent = {
  heading: 'Fresh from the blog',
  articles: [
    { id: '1', tag: 'Bridal Wear', title: '15 stunning wedding dress trends for 2026 brides', excerpt: 'Make your big day even more special with our curated selection of breathtaking bridal gowns that capture the modern romance.', img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80' },
    { id: '2', tag: 'Jewelry Guides', title: 'How to pick the perfect engagement ring', excerpt: 'From diamond cuts and clarity to selecting the perfect band style — get ready to choose an engagement ring that lasts forever.', img: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80' },
    { id: '3', tag: 'Suiting', title: 'The ultimate guide to groom and groomsmen attire', excerpt: 'Get to know the artistry behind a perfectly tailored suit, from fabric selection to the sharpest lapel styles.', img: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=600&q=80' },
  ],
}

export async function loadAttireBlogContent(): Promise<AttireBlogContent> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return ATTIRE_BLOG_FALLBACK
  }
  try {
    const supabase = createSupabaseServerClient()
    const { data } = await supabase
      .from('website_page_sections')
      .select('content')
      .eq('page_key', 'attire-and-rings')
      .eq('section_key', 'blog')
      .maybeSingle()
    const stored = data?.content as Partial<AttireBlogContent> | undefined
    if (stored?.articles?.length) {
      return { heading: stored.heading ?? ATTIRE_BLOG_FALLBACK.heading, articles: stored.articles }
    }
    return ATTIRE_BLOG_FALLBACK
  } catch {
    return ATTIRE_BLOG_FALLBACK
  }
}
