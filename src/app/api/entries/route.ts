import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다.', detail: authError?.message }, { status: 401 });
    }

    const body = await request.json();
    const { raw_text, image_url, image_thumbnail_url, input_type } = body;

    if (!raw_text && !image_url) {
      return NextResponse.json({ error: '텍스트 또는 이미지가 필요합니다.' }, { status: 400 });
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

    if (error) return NextResponse.json({ error: error.message, code: error.code }, { status: 500 });

    return NextResponse.json({ entry });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const tag = searchParams.get('tag');
  const query = searchParams.get('q');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = (page - 1) * limit;

  let dbQuery = supabase
    .from('entries')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (category && category !== 'all') {
    dbQuery = dbQuery.eq('category', category);
  }

  if (tag) {
    dbQuery = dbQuery.contains('tags', [tag]);
  }

  if (query) {
    dbQuery = dbQuery.textSearch('fts', query, { type: 'plain', config: 'simple' });
  }

  dbQuery = dbQuery.range(offset, offset + limit - 1);

  const { data: entries, count, error } = await dbQuery;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ entries: entries || [], total: count || 0, page });
}
