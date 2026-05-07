import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { createSupabaseServerClient } from '@/lib/supabase'

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Request body required' }, { status: 400 })
  }

  const {
    partner1Name,
    partner2Name,
    weddingDate,
    dateUndecided,
    city,
    region,
    guestCount,
    budgetRange,
    whatsappPhone,
    preferredCategories,
  } = body as Record<string, unknown>

  if (!partner1Name || typeof partner1Name !== 'string' || !partner1Name.trim()) {
    return NextResponse.json({ error: 'partner1Name is required' }, { status: 400 })
  }
  if (!partner2Name || typeof partner2Name !== 'string' || !partner2Name.trim()) {
    return NextResponse.json({ error: 'partner2Name is required' }, { status: 400 })
  }
  if (!city || typeof city !== 'string' || !city.trim()) {
    return NextResponse.json({ error: 'city is required' }, { status: 400 })
  }

  const supabase = createSupabaseServerClient()

  // Resolve (or provision) the public.users row for this Clerk user.
  // The webhook is the normal path, but it may not have fired yet right after
  // sign-up, so we upsert here as a reliable fallback.
  const clerkUser = await currentUser()
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress
  if (!email) {
    return NextResponse.json({ error: 'No email on Clerk account.' }, { status: 400 })
  }
  const name = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(' ') || null

  const { data: userRow, error: userError } = await supabase
    .from('users')
    .upsert(
      { clerk_id: userId, email, name, password: 'clerk-managed' },
      { onConflict: 'clerk_id' },
    )
    .select('id')
    .single()

  if (userError || !userRow) {
    console.error('[onboarding] user upsert failed', userError)
    return NextResponse.json({ error: 'Could not resolve user. Please try again.' }, { status: 500 })
  }

  const { error: upsertError } = await supabase
    .from('couple_profiles')
    .upsert(
      {
        user_id: userRow.id,
        partner1_name: (partner1Name as string).trim(),
        partner2_name: (partner2Name as string).trim(),
        wedding_date: weddingDate && typeof weddingDate === 'string' && weddingDate.trim()
          ? weddingDate.trim()
          : null,
        date_undecided: dateUndecided === true,
        city: (city as string).trim(),
        region: region && typeof region === 'string' ? region.trim() : null,
        guest_count:
          typeof guestCount === 'number' && !isNaN(guestCount) ? guestCount : null,
        budget_range:
          budgetRange && typeof budgetRange === 'string' ? budgetRange.trim() : null,
        whatsapp_phone:
          whatsappPhone && typeof whatsappPhone === 'string' && whatsappPhone.trim()
            ? whatsappPhone.trim()
            : null,
        preferred_categories: Array.isArray(preferredCategories)
          ? (preferredCategories as string[]).filter((c) => typeof c === 'string')
          : [],
      },
      { onConflict: 'user_id' },
    )

  if (upsertError) {
    console.error('[onboarding] couple_profiles upsert failed', upsertError)
    if (upsertError.code === 'PGRST205') {
      return NextResponse.json(
        { error: 'Profile table not ready — run pending Supabase migrations and reload the schema cache.' },
        { status: 503 },
      )
    }
    return NextResponse.json(
      { error: 'Unable to save your profile. Please try again.' },
      { status: 500 },
    )
  }

  return NextResponse.json({ success: true }, { status: 200 })
}
