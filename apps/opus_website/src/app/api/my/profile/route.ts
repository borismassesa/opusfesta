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
  const email = clerkUser?.emailAddresses.find(
    (e) => e.id === clerkUser.primaryEmailAddressId
  )?.emailAddress || clerkUser?.emailAddresses?.[0]?.emailAddress
  if (!email) return NextResponse.json({ error: 'No email on account.' }, { status: 400 })
  const name = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(' ') || null

  const { data: userRow, error: userErr } = await supabase
    .from('users')
    .upsert({ clerk_id: userId, email, name }, { onConflict: 'clerk_id' })
    .select('id')
    .single()

  if (userErr || !userRow) {
    console.error('[profile] user upsert failed', userErr)
    return NextResponse.json({ error: 'Could not resolve user.' }, { status: 500 })
  }

  // Read existing profile to preserve fields not included in the request
  const { data: existingProfile } = await supabase
    .from('couple_profiles')
    .select('*')
    .eq('user_id', userRow.id)
    .maybeSingle()

  const updatedProfile = {
    user_id: userRow.id,
    partner1_name: partner1Name && typeof partner1Name === 'string' && partner1Name.trim()
      ? partner1Name.trim()
      : existingProfile?.partner1_name || null,
    partner2_name: partner2Name && typeof partner2Name === 'string' && partner2Name.trim()
      ? partner2Name.trim()
      : existingProfile?.partner2_name || null,
    wedding_date: !dateUndecided && weddingDate && typeof weddingDate === 'string' && weddingDate.trim()
      ? weddingDate.trim()
      : (dateUndecided ? null : existingProfile?.wedding_date || null),
    date_undecided: dateUndecided === true || existingProfile?.date_undecided || false,
    city: city && typeof city === 'string' && city.trim()
      ? city.trim()
      : existingProfile?.city || null,
    region: region && typeof region === 'string' && region.trim()
      ? region.trim()
      : existingProfile?.region || null,
    guest_count: Number.isFinite(Number(guestCount))
      ? Number(guestCount)
      : existingProfile?.guest_count || null,
    budget_range: budgetRange && typeof budgetRange === 'string' && budgetRange.trim()
      ? budgetRange.trim()
      : existingProfile?.budget_range || null,
    whatsapp_phone: whatsappPhone && typeof whatsappPhone === 'string' && whatsappPhone.trim()
      ? whatsappPhone.trim()
      : existingProfile?.whatsapp_phone || null,
    preferred_categories: Array.isArray(preferredCategories)
      ? (preferredCategories as string[]).filter((c) => typeof c === 'string')
      : existingProfile?.preferred_categories || [],
  }

  const { error } = await supabase
    .from('couple_profiles')
    .upsert(updatedProfile, { onConflict: 'user_id' })

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
  const { data, error: deleteErr } = await supabase
    .from('users')
    .delete()
    .eq('clerk_id', userId)
    .select('id')

  if (deleteErr) {
    console.error('[profile] Supabase delete failed', { userId, error: deleteErr })
    return NextResponse.json({ error: 'Failed to delete user data.' }, { status: 500 })
  }

  if (!data || data.length === 0) {
    console.warn('[profile] No Supabase user found for clerk_id', userId)
  }

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
