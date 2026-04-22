import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken, ADMIN_COOKIE } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

async function isAuthed(req: NextRequest) {
  return verifyAdminToken(req.cookies.get(ADMIN_COOKIE)?.value)
}

// GET /api/admin/content?lang=en&section=hero
export async function GET(req: NextRequest) {
  if (!(await isAuthed(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const lang = searchParams.get('lang')
  const section = searchParams.get('section')

  const db = getSupabaseAdmin()
  let query = db.from('opus_info_content').select('lang, section_key, content')
  if (lang) query = query.eq('lang', lang)
  if (section) query = query.eq('section_key', section)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// PUT /api/admin/content — upsert a section
export async function PUT(req: NextRequest) {
  if (!(await isAuthed(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { lang, section_key, content } = await req.json()
  if (!lang || !section_key || !content) {
    return NextResponse.json({ error: 'Missing lang, section_key, or content' }, { status: 400 })
  }

  const db = getSupabaseAdmin()
  const { error } = await db.from('opus_info_content').upsert(
    { lang, section_key, content, updated_at: new Date().toISOString() },
    { onConflict: 'lang,section_key' }
  )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { revalidatePath } = await import('next/cache')
  revalidatePath('/', 'layout')

  return NextResponse.json({ ok: true })
}
