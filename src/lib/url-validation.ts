export function isAllowedImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const allowed = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!);
    return parsed.protocol === 'https:' && parsed.hostname === allowed.hostname;
  } catch {
    return false;
  }
}
