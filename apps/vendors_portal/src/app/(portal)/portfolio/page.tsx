import { createClerkSupabaseServerClient } from '@/lib/supabase'
import { getCurrentVendor } from '@/lib/vendor'
import PortfolioClient, {
  type PortfolioItem,
  type PortfolioSource,
} from './PortfolioClient'

type PortfolioRowFromDb = {
  id: string
  title: string
  images: string[] | null
  description: string | null
  event_type: string | null
  event_date: string | null
  featured: boolean | null
}

function formatEventDate(date: string | null): string | null {
  if (!date) return null
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toLocaleDateString('en-GB', {
    month: 'short',
    year: 'numeric',
  })
}

function mapRow(row: PortfolioRowFromDb): PortfolioItem {
  const images = row.images ?? []
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    eventType: row.event_type,
    eventDate: formatEventDate(row.event_date),
    coverImage: images[0] ?? null,
    imageCount: images.length,
    featured: row.featured ?? false,
  }
}

async function loadPortfolio(): Promise<{
  items: PortfolioItem[]
  source: PortfolioSource
}> {
  const state = await getCurrentVendor()
  if (state.kind === 'no-env') {
    return { items: [], source: { kind: 'no-env' } }
  }
  if (state.kind === 'no-membership') {
    return { items: [], source: { kind: 'no-membership' } }
  }

  const supabase = await createClerkSupabaseServerClient()
  const portfolio = await supabase
    .from('portfolio')
    .select('id, title, images, description, event_type, event_date, featured')
    .eq('vendor_id', state.vendor.id)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })
    .returns<PortfolioRowFromDb[]>()

  if (portfolio.error) {
    throw new Error(
      `[portfolio] portfolio query failed: ${portfolio.error.code} ${portfolio.error.message}`,
    )
  }

  return {
    items: (portfolio.data ?? []).map(mapRow),
    source: { kind: 'live' },
  }
}

export default async function PortfolioPage() {
  const { items, source } = await loadPortfolio()
  return <PortfolioClient items={items} source={source} />
}
