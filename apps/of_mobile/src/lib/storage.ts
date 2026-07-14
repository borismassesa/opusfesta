/**
 * Uploads a local file URI to a Supabase Storage bucket via the REST object
 * endpoint (not the JS SDK's storage client, to keep this callable with just
 * a bearer token rather than a full SupabaseClient instance). Returns the
 * public URL on success, or null on failure - callers decide whether a
 * failed upload should block the surrounding flow.
 */
export async function uploadToBucket(
  bucket: string,
  path: string,
  localUri: string,
  token: string,
  supabaseUrl: string
): Promise<string | null> {
  try {
    const blob = await fetch(localUri).then((r) => r.blob());
    const res = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'image/jpeg',
      },
      body: blob,
    });

    if (!res.ok) return null;
    return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
  } catch {
    return null;
  }
}
