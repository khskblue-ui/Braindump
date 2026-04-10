import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

// GET: list user's correction history
export async function GET() {
  try {
    const auth = await requireAuth();
    if ('error' in auth && auth.error) return auth.error;
    const { supabase, user } = auth as Exclude<typeof auth, { error: NextResponse }>;

    const { data, error } = await supabase
      .from('user_classify_patterns')
      .select('id, original_categories, corrected_categories, original_tags, corrected_tags, keyword_context, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: '교정 이력을 불러올 수 없습니다.' }, { status: 500 });
    return NextResponse.json({ patterns: data });
  } catch {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// DELETE: remove a pattern by id, or all patterns if id=all
export async function DELETE(req: Request) {
  try {
    const auth = await requireAuth();
    if ('error' in auth && auth.error) return auth.error;
    const { supabase, user } = auth as Exclude<typeof auth, { error: NextResponse }>;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id가 필요합니다.' }, { status: 400 });

    if (id === 'all') {
      const { error } = await supabase
        .from('user_classify_patterns')
        .delete()
        .eq('user_id', user.id);
      if (error) return NextResponse.json({ error: '전체 초기화에 실패했습니다.' }, { status: 500 });
    } else {
      const { error } = await supabase
        .from('user_classify_patterns')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      if (error) return NextResponse.json({ error: '교정 이력 삭제에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
