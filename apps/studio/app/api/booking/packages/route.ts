import { NextResponse } from 'next/server';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    const db = getStudioSupabaseAdmin();
    // Only fetch active packages for the public facing booking form
    const { data, error } = await db
      .from('studio_packages')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
      
    if (error) {
      console.error('[PUBLIC API] Error fetching packages:', error.message);
      return NextResponse.json({ error: 'Failed to load packages' }, { status: 500 });
    }
    
    return NextResponse.json({ packages: data || [] });
  } catch (e) {
    console.error('[PUBLIC API] Exception fetching packages:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
