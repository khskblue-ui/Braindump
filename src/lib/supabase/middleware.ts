import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const isAuthPage = request.nextUrl.pathname.startsWith('/login');
  const isApiRoute = request.nextUrl.pathname.startsWith('/api');

  // API 라우트는 각 핸들러에서 requireAuth() → getUser()로 검증
  if (isApiRoute) {
    return supabaseResponse;
  }

  // 페이지 네비게이션: getSession()으로 빠른 로컬 JWT 체크 (네트워크 호출 없음)
  // 보안: 실제 데이터 접근은 API 라우트의 requireAuth() → getUser()가 담당
  // 이 레이어는 리다이렉트 판단만 하므로 로컬 세션 체크로 충분
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  // 미인증 사용자 → 로그인 페이지로
  if (!user && !isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // 인증된 사용자가 로그인 페이지 접근 → 메인으로
  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
