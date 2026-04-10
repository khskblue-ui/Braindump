import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

// GET: list user's custom classify rules
export async function GET() {
  try {
    const auth = await requireAuth();
    if ('error' in auth && auth.error) return auth.error;
    const { supabase, user } = auth as Exclude<typeof auth, { error: NextResponse }>;

    const { data, error } = await supabase
      .from('user_classify_rules')
      .select('id, keyword, category, context, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: '규칙을 불러올 수 없습니다.' }, { status: 500 });
    return NextResponse.json({ rules: data });
  } catch {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// POST: add a new custom rule
export async function POST(req: Request) {
  try {
    const auth = await requireAuth();
    if ('error' in auth && auth.error) return auth.error;
    const { supabase, user } = auth as Exclude<typeof auth, { error: NextResponse }>;

    const body = await req.json();
    const { keyword, category, context } = body;

    if (!keyword || typeof keyword !== 'string' || !keyword.trim()) {
      return NextResponse.json({ error: '키워드를 입력해주세요.' }, { status: 400 });
    }
    const validCategories = ['task', 'idea', 'memo', 'knowledge', 'schedule', 'inbox'];
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: '올바른 카테고리를 선택해주세요.' }, { status: 400 });
    }

    // Check max 50 rules
    const { count } = await supabase
      .from('user_classify_rules')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);
    if ((count ?? 0) >= 50) {
      return NextResponse.json({ error: '규칙은 최대 50개까지 추가할 수 있습니다.' }, { status: 400 });
    }

    const insertData: Record<string, unknown> = {
      user_id: user.id,
      keyword: keyword.trim(),
      category,
    };
    if (context && (context === 'personal' || context === 'work') &&
        (category === 'task' || category === 'schedule')) {
      insertData.context = context;
    }

    const { data, error } = await supabase
      .from('user_classify_rules')
      .insert(insertData)
      .select()
      .single();

    if (error) return NextResponse.json({ error: '규칙 추가에 실패했습니다.' }, { status: 500 });
    return NextResponse.json({ rule: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// DELETE: remove a rule by id (passed as query param)
export async function DELETE(req: Request) {
  try {
    const auth = await requireAuth();
    if ('error' in auth && auth.error) return auth.error;
    const { supabase, user } = auth as Exclude<typeof auth, { error: NextResponse }>;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id가 필요합니다.' }, { status: 400 });

    const { error } = await supabase
      .from('user_classify_rules')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) return NextResponse.json({ error: '규칙 삭제에 실패했습니다.' }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
