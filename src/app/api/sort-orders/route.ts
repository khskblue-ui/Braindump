import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if ('error' in auth && auth.error) return auth.error;
  const { supabase, user } = auth as Exclude<typeof auth, { error: NextResponse }>;

  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  if (!category) {
    return NextResponse.json({ error: 'category 파라미터가 필요합니다.' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('entry_sort_orders')
    .select('entry_id, sort_order')
    .eq('user_id', user.id)
    .eq('category', category)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Sort orders fetch error:', error);
    return NextResponse.json({ error: '정렬 순서 조회에 실패했습니다.' }, { status: 500 });
  }

  return NextResponse.json({ sortOrders: data ?? [] });
}

export async function PUT(request: NextRequest) {
  const auth = await requireAuth();
  if ('error' in auth && auth.error) return auth.error;
  const { supabase, user } = auth as Exclude<typeof auth, { error: NextResponse }>;

  const body = await request.json();
  const { category, orders } = body as {
    category: string;
    orders: { entry_id: string; sort_order: number }[];
  };

  if (!category || !Array.isArray(orders)) {
    return NextResponse.json({ error: 'category와 orders가 필요합니다.' }, { status: 400 });
  }

  const upsertData = orders.map(({ entry_id, sort_order }) => ({
    entry_id,
    user_id: user.id,
    category,
    sort_order,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from('entry_sort_orders')
    .upsert(upsertData, { onConflict: 'entry_id,user_id,category' });

  if (error) {
    console.error('Sort orders upsert error:', error);
    return NextResponse.json({ error: '정렬 순서 저장에 실패했습니다.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
