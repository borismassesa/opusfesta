'use server'

import { revalidatePath } from 'next/cache'
import { revalidateOpusPass } from '@/lib/revalidate'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { requireAdminRole, type AdminAccessRole } from '@/lib/admin-auth'

// Same role allowlist as /lib/cms/upload-media.ts — carousel scenes are
// CMS-managed editorial content, not data the editor role should be locked
// out of.
const CAROUSEL_EDIT_ROLES: AdminAccessRole[] = ['owner', 'admin', 'editor']

export type MockupScene = {
  scene: string
  url: string
  label: string | null
  sort_order: number
}

export async function upsertMockupCarouselScenes(scenes: MockupScene[]): Promise<void> {
  await requireAdminRole(CAROUSEL_EDIT_ROLES)
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase
    .from('website_cms_mockup_carousel')
    .upsert(scenes, { onConflict: 'scene' })
  if (error) throw error

  revalidatePath('/cms/opus-pass/mockup-carousel')
  await revalidateOpusPass('/invitations', '/invitations/catalog', '/invitations/p')
}

export async function deleteMockupCarouselScene(scene: string): Promise<void> {
  await requireAdminRole(CAROUSEL_EDIT_ROLES)
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase
    .from('website_cms_mockup_carousel')
    .delete()
    .eq('scene', scene)
  if (error) throw error

  revalidatePath('/cms/opus-pass/mockup-carousel')
  await revalidateOpusPass('/invitations', '/invitations/catalog', '/invitations/p')
}
