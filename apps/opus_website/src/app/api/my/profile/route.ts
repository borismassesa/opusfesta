import { NextResponse } from 'next/server'
import { auth, currentUser, clerkClient } from '@clerk/nextjs/server'
import { createSupabaseServerClient } from '@/lib/supabase'

// ── PATCH — update couple profile ─────────────────────────────────────────

export async function PATCH(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const {
    partner1Name, partner2Name, weddingDate, dateUndecided,
    city, region, guestCount, budgetRange, whatsappPhone, preferredCategories,
  } = body as Record<string, unknown>

  if (!partner1Name || typeof partner1Name !== 'string' || !partner1Name.trim())
    return NextResponse.json({ error: 'partner1Name is required' }, { status: 400 })
  if (!partner2Name || typeof partner2Name !== 'string' || !partner2Name.trim())
    return NextResponse.json({ error: 'partner2Name is required' }, { status: 400 })
  if (!city || typeof city !== 'string' || !city.trim())
    return NextResponse.json({ error: 'city is required' }, { status: 400 })

  const supabase = createSupabaseServerClient()

  // Ensure user row exists (webhook may not have fired yet)
  const clerkUser = await currentUser()
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress
  if (!email) return NextResponse.json({ error: 'No email on account.' }, { status: 400 })
  const name = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(' ') || null

  const { data: userRow, error: userErr } = await supabase
    .from('users')
    .upsert({ clerk_id: userId, email, name, password: 'clerk-managed' }, { onConflict: 'clerk_id' })
    .select('id')
    .single()

  if (userErr || !userRow) {
    console.error('[profile] user upsert failed', userErr)
    return NextResponse.json({ error: 'Could not resolve user.' }, { status: 500 })
  }

  const { error } = await supabase
    .from('couple_profiles')
    .upsert(
      {
        user_id: userRow.id,
        partner1_name: (partner1Name as string).trim(),
        partner2_name: (partner2Name as string).trim(),
        wedding_date: !dateUndecided && weddingDate && typeof weddingDate === 'string' && weddingDate.trim()
          ? weddingDate.trim() : null,
        date_undecided: dateUndecided === true,
        city: (city as string).trim(),
        region: region && typeof region === 'string' ? region.trim() : null,
        guest_count: typeof guestCount === 'number' && !isNaN(guestCount) ? guestCount : null,
        budget_range: budgetRange && typeof budgetRange === 'string' ? budgetRange.trim() : null,
        whatsapp_phone: whatsappPhone && typeof whatsappPhone === 'string' && whatsappPhone.trim()
          ? whatsappPhone.trim() : null,
        preferred_categories: Array.isArray(preferredCategories)
          ? (preferredCategories as string[]).filter((c) => typeof c === 'string') : [],
      },
      { onConflict: 'user_id' },
    )

  if (error) {
    console.error('[profile] update failed', error)
    if (error.code === 'PGRST205') {
      return NextResponse.json(
        { error: 'Profile table not ready — run pending Supabase migrations and reload the schema cache.' },
        { status: 503 },
      )
    }
    return NextResponse.json({ error: 'Update failed. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

// ── DELETE — remove account entirely ──────────────────────────────────────

export async function DELETE() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createSupabaseServerClient()

  // Remove from public.users — cascades to couple_profiles + clears inquiries user_id
  await supabase.from('users').delete().eq('clerk_id', userId)

  // Delete the Clerk account last so the session stays valid until we're done
  try {
    const client = await clerkClient()
    await client.users.deleteUser(userId)
  } catch (err) {
    console.error('[profile] Clerk deleteUser failed', err)
    return NextResponse.json({ error: 'Failed to delete account from auth provider.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
