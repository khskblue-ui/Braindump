import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { isAllowedImageUrl } from '@/lib/url-validation';
import { attachSignedUrls } from '@/lib/signed-url';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if ('error' in auth && auth.error) return auth.error;
    const { supabase, user } = auth as Exclude<typeof auth, { error: NextResponse }>;

    const body = await request.json();
    const { raw_text, image_url, image_thumbnail_url, input_type } = body;

    if (!raw_text && !image_url) {
      return NextResponse.json({ error: '텍스트 또는 이미지가 필요합니다.' }, { status: 400 });
    }

    // Validate image_url if provided (prevent SSRF)
    if (image_url && !isAllowedImageUrl(image_url)) {
      return NextResponse.json({ error: '허용되지 않은 이미지 URL입니다.' }, { status: 400 });
    }
    if (image_thumbnail_url && !isAllowedImageUrl(image_thumbnail_url)) {
      return NextResponse.json({ error: '허용되지 않은 이미지 URL입니다.' }, { status: 400 });
    }

    const { data: entry, error } = await supabase
      .from('entries')
      .insert({
        user_id: user.id,
        raw_text: raw_text || null,
        image_url: image_url || null,
        image_thumbnail_url: image_thumbnail_url || null,
        input_type: input_type || 'text',
        category: 'inbox',
      })
      .select()
      .single();

    if (error) {
      console.error('Entry creation error:', error);
      return NextResponse.json({ error: '항목 생성에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ entry });
  } catch (e: unknown) {
    console.error('Entry creation error:', e);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if ('error' in auth && auth.error) return auth.error;
  const { supabase, user } = auth as Exclude<typeof auth, { error: NextResponse }>;

  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const tag = searchParams.get('tag');
  const query = searchParams.get('q');
  const rawPage = parseInt(searchParams.get('page') || '1');
  const rawLimit = parseInt(searchParams.get('limit') || '20');
  const page = isNaN(rawPage) || rawPage < 1 ? 1 : Math.min(rawPage, 1000);
  const limit = isNaN(rawLimit) || rawLimit < 1 ? 20 : Math.min(rawLimit, 100);
  const offset = (page - 1) * limit;

  const isSchedule = category === 'schedule';

  let dbQuery = supabase
    .from('entries')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null);

  // Always fetch with created_at DESC; schedule sorting done in JS after fetch
  dbQuery = dbQuery.order('created_at', { ascending: false });

  if (category && category !== 'all') {
    dbQuery = dbQuery.eq('category', category);
  }

  if (tag) {
    dbQuery = dbQuery.contains('tags', [tag]);
  }

  if (query) {
    const q = query.replace(/%/g, '\\%').replace(/_/g, '\\_');
    const tagQuery = query.replace(/^#/, '');

    // Two separate queries: text search + tag search, merged client-side
    // because PostgREST .or() doesn't reliably support .cs on JSONB arrays
    const textQuery = supabase
      .from('entries')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .or(`raw_text.ilike.%${q}%,summary.ilike.%${q}%,extracted_text.ilike.%${q}%`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit);

    if (category && category !== 'all') {
      textQuery.eq('category', category);
    }

    const tagSearchQuery = supabase
      .from('entries')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .contains('tags', [tagQuery])
      .order('created_at', { ascending: false })
      .range(offset, offset + limit);

    if (category && category !== 'all') {
      tagSearchQuery.eq('category', category);
    }

    const [textResult, tagResult] = await Promise.all([textQuery, tagSearchQuery]);

    if (textResult.error || tagResult.error) {
      console.error('Search error:', textResult.error || tagResult.error);
      return NextResponse.json({ error: '검색에 실패했습니다.' }, { status: 500 });
    }

    // Merge and deduplicate by id, sort by created_at desc
    const merged = new Map<string, typeof textResult.data[0]>();
    for (const e of [...(textResult.data || []), ...(tagResult.data || [])]) {
      if (!merged.has(e.id)) merged.set(e.id, e);
    }
    const allEntries = [...merged.values()]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const hasMore = allEntries.length > limit;
    const trimmedEntries = hasMore ? allEntries.slice(0, limit) : allEntries;
    const entriesWithSignedUrls = trimmedEntries.length > 0 ? await attachSignedUrls(supabase, trimmedEntries) : [];

    return NextResponse.json({ entries: entriesWithSignedUrls, hasMore, page });
  }

  dbQuery = dbQuery.range(offset, offset + limit); // request limit+1 items

  const { data: entries, error } = await dbQuery;

  if (error) {
    console.error('Entry fetch error:', error);
    return NextResponse.json({ error: '항목 조회에 실패했습니다.' }, { status: 500 });
  }

  let sortedEntries = entries ?? [];

  // Schedule: upcoming (due_date ASC) first, no due_date in middle, past (due_date DESC) at end
  if (isSchedule && sortedEntries.length > 0) {
    const now = Date.now();
    const upcoming = sortedEntries
      .filter((e) => e.due_date && new Date(e.due_date).getTime() >= now)
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
    const past = sortedEntries
      .filter((e) => e.due_date && new Date(e.due_date).getTime() < now)
      .sort((a, b) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime());
    const noDue = sortedEntries.filter((e) => !e.due_date);
    sortedEntries = [...upcoming, ...noDue, ...past];
  }

  const hasMore = sortedEntries.length > limit;
  const trimmedEntries = hasMore ? sortedEntries.slice(0, limit) : sortedEntries;

  // Generate signed URLs for image entries
  const entriesWithSignedUrls = trimmedEntries.length > 0 ? await attachSignedUrls(supabase, trimmedEntries) : [];

  return NextResponse.json({ entries: entriesWithSignedUrls, hasMore, page });
}
