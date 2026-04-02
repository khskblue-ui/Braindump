import type { SupabaseClient } from '@supabase/supabase-js';

const SIGNED_URL_EXPIRY = 3600; // 1 hour
const BUCKET = 'entry-images';

/**
 * Extract storage path from a full Supabase image URL.
 * e.g. "https://xxx.supabase.co/storage/v1/object/public/entry-images/user/file.jpg"
 *   → "user/file.jpg"
 */
function extractPath(imageUrl: string): string | null {
  try {
    const url = new URL(imageUrl);
    const segment = url.pathname.split(`/${BUCKET}/`)[1];
    return segment || null;
  } catch {
    return null;
  }
}

/**
 * Batch generate signed URLs for entries.
 * Uses createSignedUrls (plural) — single API call for all paths.
 */
export async function attachSignedUrls<T extends { image_url?: string | null; image_thumbnail_url?: string | null }>(
  supabase: SupabaseClient,
  entries: T[]
): Promise<T[]> {
  // Collect all paths that need signing
  const pathMap: { index: number; field: 'image_url' | 'image_thumbnail_url'; path: string }[] = [];

  entries.forEach((entry, index) => {
    if (entry.image_url) {
      const path = extractPath(entry.image_url);
      if (path) pathMap.push({ index, field: 'image_url', path });
    }
    if (entry.image_thumbnail_url) {
      const path = extractPath(entry.image_thumbnail_url);
      if (path) pathMap.push({ index, field: 'image_thumbnail_url', path });
    }
  });

  // No images to sign
  if (pathMap.length === 0) return entries;

  // Single batch API call
  const allPaths = pathMap.map((p) => p.path);
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(allPaths, SIGNED_URL_EXPIRY);

  if (error || !data) return entries;

  // Build a path → signedUrl lookup
  const signedMap = new Map<string, string>();
  data.forEach((item) => {
    if (item.path && item.signedUrl && !item.error) {
      signedMap.set(item.path, item.signedUrl);
    }
  });

  // Apply signed URLs to entries
  const result = entries.map((entry) => ({ ...entry }));
  pathMap.forEach(({ index, field, path }) => {
    const signedUrl = signedMap.get(path);
    if (signedUrl) {
      (result[index] as Record<string, unknown>)[field] = signedUrl;
    }
  });

  return result;
}
