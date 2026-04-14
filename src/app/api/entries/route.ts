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
        categories: ['inbox'],
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
    dbQuery = dbQuery.contains('categories', [category]);
  }

  if (tag) {
    const sanitizedTag = tag.replace(/%/g, '\\%').replace(/_/g, '\\_');
    dbQuery = dbQuery.filter('tags::text', 'ilike', `%${sanitizedTag}%`);
  }

  const context = searchParams.get('context');
  if (context && (context === 'personal' || context === 'work')) {
    dbQuery = dbQuery.or(`context.eq.${context},context.is.null`);
  }

  if (query) {
    const q = query.replace(/%/g, '\\%').replace(/_/g, '\\_').replace(/,/g, '\\,').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
    const tagQ = query.replace(/^#/, '').replace(/%/g, '\\%').replace(/_/g, '\\_');

    // Text search: .or() works for plain column ilike filters
    const textQuery = supabase
      .from('entries')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .or(`raw_text.ilike.%${q}%,summary.ilike.%${q}%,extracted_text.ilike.%${q}%,topic.ilike.%${q}%`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit);

    if (category && category !== 'all') {
      textQuery.contains('categories', [category]);
    }

    // Tag search: fetch all non-deleted user entries with tags, then filter in JS.
    // PostgREST cannot cast text[] to text for ilike inside .or() (PGRST100)
    // and .filter('tags::text', ...) fails because text[] ~~* is not a valid operator.
    const tagSearchQuery = supabase
      .from('entries')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .not('tags', 'is', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit);

    if (category && category !== 'all') {
      tagSearchQuery.contains('categories', [category]);
    }

    const [textResult, tagResult] = await Promise.all([textQuery, tagSearchQuery]);

    if (textResult.error || tagResult.error) {
      console.error('Search error:', textResult.error || tagResult.error);
      return NextResponse.json({ error: '검색에 실패했습니다.' }, { status: 500 });
    }

    // Filter tags in JS since PostgREST can't ilike on text[] columns
    const tagLower = tagQ.toLowerCase();
    const tagMatches = (tagResult.data || []).filter((e) =>
      Array.isArray(e.tags) && e.tags.some((t: string) => t.toLowerCase().includes(tagLower))
    );

    // Merge and deduplicate by id, apply unified sort
    const merged = new Map<string, typeof textResult.data[0]>();
    for (const e of [...(textResult.data || []), ...tagMatches]) {
      // Apply context filter in JS to avoid double .or() conflict with PostgREST
      if (context && (context === 'personal' || context === 'work')) {
        if (e.context !== context && e.context !== null) continue;
      }
      if (!merged.has(e.id)) merged.set(e.id, e);
    }

    // Fetch category sort orders if a specific category is active
    let catSortMap = new Map<string, number>();
    if (category && category !== 'all') {
      const { data: sortOrderData } = await supabase
        .from('entry_sort_orders')
        .select('entry_id, sort_order')
        .eq('user_id', user.id)
        .eq('category', category);
      if (sortOrderData && sortOrderData.length > 0) {
        catSortMap = new Map(sortOrderData.map((r) => [r.entry_id, r.sort_order]));
      }
    }

    const allEntries = [...merged.values()].sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
      if (catSortMap.size > 0) {
        const aOrder = catSortMap.get(a.id);
        const bOrder = catSortMap.get(b.id);
        if (aOrder != null && bOrder != null) return aOrder - bOrder;
        if (aOrder != null) return -1;
        if (bOrder != null) return 1;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    // hasMore: true only if either sub-query returned a full page (limit+1 rows from inclusive range)
    const textFull = (textResult.data?.length ?? 0) > limit;
    const tagFull = tagMatches.length > limit;
    const hasMore = textFull || tagFull;
    const trimmedEntries = allEntries.slice(0, limit);
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

  // Fetch category sort orders if a specific category is active
  let catSortMap = new Map<string, number>();
  if (category && category !== 'all' && sortedEntries.length > 0) {
    const { data: sortOrderData } = await supabase
      .from('entry_sort_orders')
      .select('entry_id, sort_order')
      .eq('user_id', user.id)
      .eq('category', category);
    if (sortOrderData && sortOrderData.length > 0) {
      catSortMap = new Map(sortOrderData.map((r) => [r.entry_id, r.sort_order]));
    }
  }

  // Unified sort: pinned → category sort_order (if available) → created_at
  if (sortedEntries.length > 0) {
    sortedEntries = [...sortedEntries].sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
      if (catSortMap.size > 0) {
        const aOrder = catSortMap.get(a.id);
        const bOrder = catSortMap.get(b.id);
        if (aOrder != null && bOrder != null) return aOrder - bOrder;
        if (aOrder != null) return -1;
        if (bOrder != null) return 1;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }

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
