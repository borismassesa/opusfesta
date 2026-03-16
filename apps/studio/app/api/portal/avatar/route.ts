import { NextRequest, NextResponse } from 'next/server';
import { getPortalClient } from '@/lib/portal-auth';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: NextRequest) {
  const client = await getPortalClient();
  if (!client) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get('avatar') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Only JPG, PNG, and WebP images are allowed' }, { status: 400 });
  }

  // Validate file size (2MB max)
  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: 'File size must be under 2MB' }, { status: 400 });
  }

  const db = getStudioSupabaseAdmin();
  const ext = file.name.split('.').pop() || 'jpg';
  const filePath = `${client.id}/avatar.${ext}`;

  // Upload to Supabase Storage
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: uploadError } = await db.storage
    .from('portal-avatars')
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    console.error('[PORTAL] Avatar upload error:', uploadError.message);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }

  // Get public URL
  const { data: urlData } = db.storage
    .from('portal-avatars')
    .getPublicUrl(filePath);

  const avatarUrl = `${urlData.publicUrl}?v=${Date.now()}`;

  // Update client profile
  const { error: updateError } = await db
    .from('studio_client_profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', client.id);

  if (updateError) {
    console.error('[PORTAL] Avatar URL update error:', updateError.message);
    return NextResponse.json({ error: 'Failed to save avatar' }, { status: 500 });
  }

  return NextResponse.json({ avatar_url: avatarUrl });
}

export async function DELETE() {
  const client = await getPortalClient();
  if (!client) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getStudioSupabaseAdmin();

  // Remove files from storage
  const { data: files } = await db.storage
    .from('portal-avatars')
    .list(client.id);

  if (files && files.length > 0) {
    await db.storage
      .from('portal-avatars')
      .remove(files.map(f => `${client.id}/${f.name}`));
  }

  // Clear avatar_url in profile
  await db
    .from('studio_client_profiles')
    .update({ avatar_url: null })
    .eq('id', client.id);

  return NextResponse.json({ success: true });
}
