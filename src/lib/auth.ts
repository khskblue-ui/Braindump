import { createClient } from '@/lib/supabase/server';
import { createClient as createAnonClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function requireAuth(req?: NextRequest) {
  // Bearer token auth (iOS app)
  const authHeader = req?.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const supabase = createAnonClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return { error: NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 }) };
    }
    return { supabase, user };
  }

  // Cookie-based auth (web)
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return { error: NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 }) };
  }
  return { supabase, user };
}
