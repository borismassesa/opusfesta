import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

const payloadSchema = z.object({
  slug: z.string().min(1),
})

const getSupabaseWriteClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    return null
  }

  const supabaseKey = serviceRoleKey || anonKey

  if (!supabaseKey) {
    return null
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = payloadSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const supabase = getSupabaseWriteClient()

    if (!supabase) {
      return NextResponse.json({ success: true, skipped: true })
    }

    const { error } = await supabase.rpc('increment_advice_ideas_post_view', {
      post_slug: parsed.data.slug,
    })

    if (error) {
      console.error('Error incrementing view count:', error)
      return NextResponse.json({ success: false, skipped: true })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error incrementing view count:', error)
    return NextResponse.json({ success: false, skipped: true })
  }
}
