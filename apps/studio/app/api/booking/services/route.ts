import { NextResponse } from 'next/server';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    const db = getStudioSupabaseAdmin();
    // Only fetch active services for the public facing booking form
    const { data, error } = await db
      .from('studio_services')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
      
    if (error) {
      console.error('[PUBLIC API] Error fetching services:', error.message);
      return NextResponse.json({ error: 'Failed to load services' }, { status: 500 });
    }
    
    return NextResponse.json({ services: data || [] });
  } catch (e) {
    console.error('[PUBLIC API] Exception fetching services:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
