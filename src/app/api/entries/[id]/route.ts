import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  // Allowlist only updatable fields
  const allowed: Record<string, unknown> = {};
  const fields = ['raw_text', 'category', 'tags', 'topic', 'summary', 'due_date', 'priority', 'is_completed'] as const;
  for (const key of fields) {
    if (key in body) allowed[key] = body[key];
  }

  const { data: entry, error } = await supabase
    .from('entries')
    .update(allowed)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!entry) return NextResponse.json({ error: '항목을 찾을 수 없습니다.' }, { status: 404 });

  return NextResponse.json({ entry });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });

  const { id } = await params;

  // Get entry to check for image
  const { data: entry } = await supabase
    .from('entries')
    .select('image_url')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  // Delete image from storage if exists
  if (entry?.image_url) {
    const path = new URL(entry.image_url).pathname.split('/entry-images/')[1];
    if (path) {
      await supabase.storage.from('entry-images').remove([path]);
    }
  }

  const { error } = await supabase
    .from('entries')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
