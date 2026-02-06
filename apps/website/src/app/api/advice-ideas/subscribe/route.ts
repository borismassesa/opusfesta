import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

const payloadSchema = z.object({
  email: z.string().email(),
  source: z.string().optional(),
})

const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, serviceRoleKey, {
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

    const email = parsed.data.email.trim().toLowerCase()
    const source = parsed.data.source ?? 'advice-ideas'

    const supabase = getSupabaseAdmin()
    const { error } = await supabase
      .from('advice_ideas_newsletter_subscribers')
      .upsert(
        {
          email,
          status: 'active',
          source,
        },
        {
          onConflict: 'email',
        },
      )

    if (error) {
      console.error('Error subscribing to newsletter:', error)
      return NextResponse.json({ error: 'Unable to subscribe' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error subscribing to newsletter:', error)
    return NextResponse.json({ error: 'Unable to subscribe' }, { status: 500 })
  }
}
