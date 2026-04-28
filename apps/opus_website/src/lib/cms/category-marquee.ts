import { createSupabaseServerClient } from '@/lib/supabase'

export type CategoryItem = {
  id: string
  name: string
  bg: string
  text: string
  visible?: boolean // default: true. Hide without deleting.
}

export type CategoryMarqueeContent = {
  items: CategoryItem[]
}

export const CATEGORY_MARQUEE_FALLBACK: CategoryMarqueeContent = {
  items: [
    { id: 'venues', name: 'Venues', bg: '#1A1A1A', text: '#FFE500' },
    { id: 'photography', name: 'Photography', bg: '#C9A0DC', text: '#1A1A1A' },
    { id: 'videography', name: 'Videography', bg: '#5C00F2', text: '#ffffff' },
    { id: 'catering', name: 'Catering', bg: '#FF3D00', text: '#ffffff' },
    { id: 'florists', name: 'Florists', bg: '#00701A', text: '#FFE500' },
    { id: 'djs', name: 'DJs', bg: '#FFE500', text: '#1A1A1A' },
    { id: 'live-bands', name: 'Live Bands', bg: '#E8003D', text: '#ffffff' },
    { id: 'hair-makeup', name: 'Hair & Makeup', bg: '#7B00D4', text: '#ffffff' },
    { id: 'wedding-planners', name: 'Wedding Planners', bg: '#0057FF', text: '#ffffff' },
    { id: 'rentals', name: 'Rentals', bg: '#FF6B00', text: '#1A1A1A' },
    { id: 'wedding-cakes', name: 'Wedding Cakes', bg: '#FF85A1', text: '#1A1A1A' },
    { id: 'bridal-salons', name: 'Bridal Salons', bg: '#F5E6FF', text: '#1A1A1A' },
    { id: 'officiants', name: 'Officiants', bg: '#003566', text: '#ffffff' },
    { id: 'transportation', name: 'Transportation', bg: '#2D6A4F', text: '#ffffff' },
    { id: 'photo-booths', name: 'Photo Booths', bg: '#F77F00', text: '#1A1A1A' },
    { id: 'bar-services', name: 'Bar Services', bg: '#6A0572', text: '#ffffff' },
    { id: 'invitations', name: 'Invitations', bg: '#D62828', text: '#ffffff' },
    { id: 'decor', name: 'Décor', bg: '#023E8A', text: '#ffffff' },
    { id: 'jewellers', name: 'Jewellers', bg: '#B5838D', text: '#ffffff' },
    { id: 'mc', name: 'MC', bg: '#264653', text: '#ffffff' },
    { id: 'soloists', name: 'Soloists & Ensembles', bg: '#606C38', text: '#ffffff' },
    { id: 'dance-lessons', name: 'Dance Lessons', bg: '#9B2226', text: '#ffffff' },
    { id: 'favours-gifts', name: 'Favours & Gifts', bg: '#E9C46A', text: '#1A1A1A' },
    { id: 'beauty-services', name: 'Beauty Services', bg: '#A8DADC', text: '#1A1A1A' },
    { id: 'honeymoon', name: 'Honeymoon', bg: '#457B9D', text: '#ffffff' },
    { id: 'hotel-blocks', name: 'Hotel Blocks', bg: '#1D3557', text: '#ffffff' },
  ],
}

export async function loadCategoryMarqueeContent(): Promise<CategoryMarqueeContent> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return CATEGORY_MARQUEE_FALLBACK
  }
  try {
    const supabase = createSupabaseServerClient()
    const { data } = await supabase
      .from('website_page_sections')
      .select('content')
      .eq('page_key', 'home')
      .eq('section_key', 'category-marquee')
      .maybeSingle()
    const stored = data?.content as Partial<CategoryMarqueeContent> | undefined
    if (stored && Array.isArray(stored.items) && stored.items.length > 0) {
      return { items: stored.items as CategoryItem[] }
    }
    return CATEGORY_MARQUEE_FALLBACK
  } catch {
    return CATEGORY_MARQUEE_FALLBACK
  }
}
