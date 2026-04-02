import type { SupabaseClient } from '@supabase/supabase-js';

const SIGNED_URL_EXPIRY = 3600; // 1 hour

export async function generateSignedUrl(
  supabase: SupabaseClient,
  imageUrl: string,
  bucket: string = 'entry-images'
): Promise<string | null> {
  try {
    const url = new URL(imageUrl);
    const pathSegment = url.pathname.split(`/${bucket}/`)[1];
    if (!pathSegment) return null;

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(pathSegment, SIGNED_URL_EXPIRY);

    if (error || !data?.signedUrl) return null;
    return data.signedUrl;
  } catch {
    return null;
  }
}

export async function attachSignedUrls<T extends { image_url?: string | null; image_thumbnail_url?: string | null }>(
  supabase: SupabaseClient,
  entries: T[]
): Promise<T[]> {
  return Promise.all(
    entries.map(async (entry) => {
      const result = { ...entry };
      if (entry.image_url) {
        const signed = await generateSignedUrl(supabase, entry.image_url);
        if (signed) result.image_url = signed;
      }
      if (entry.image_thumbnail_url) {
        const signed = await generateSignedUrl(supabase, entry.image_thumbnail_url);
        if (signed) result.image_thumbnail_url = signed;
      }
      return result;
    })
  );
}
