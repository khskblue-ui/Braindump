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

  const pathname = request.nextUrl.pathname;
  const isLanding = pathname === '/';
  const isAuthPage = pathname.startsWith('/login');
  const isPublicPage = pathname.startsWith('/privacy') || pathname.startsWith('/guide');
  const isApiRoute = pathname.startsWith('/api');

  // API 라우트는 각 핸들러에서 requireAuth() → getUser()로 검증
  if (isApiRoute) {
    return supabaseResponse;
  }

  // 페이지 네비게이션: getSession()으로 빠른 로컬 JWT 체크 (네트워크 호출 없음)
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  // 인증된 사용자가 랜딩 또는 로그인 페이지 접근 → /home으로
  if (user && (isLanding || isAuthPage)) {
    const url = request.nextUrl.clone();
    url.pathname = '/home';
    return NextResponse.redirect(url);
  }

  // 랜딩 페이지는 공개
  if (isLanding) {
    return supabaseResponse;
  }

  // 공개 페이지는 인증 불필요
  if (isPublicPage) {
    return supabaseResponse;
  }

  // 미인증 사용자 → 로그인 페이지로
  if (!user && !isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
