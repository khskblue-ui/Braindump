'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { detectBrowserContext, type BrowserContext } from '@/lib/browser-detect';
import { InstallGuideModal } from '@/components/landing/InstallGuideModal';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ExternalLink } from 'lucide-react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [browserCtx, setBrowserCtx] = useState<BrowserContext | null>(null);
  const [installModalOpen, setInstallModalOpen] = useState(false);

  const { signInWithEmail, signUpWithEmail, signInWithGoogle, signInWithApple } = useAuthStore();

  useEffect(() => {
    setBrowserCtx(detectBrowserContext());
  }, []);

  const isInApp = browserCtx?.type === 'inapp' || browserCtx?.type === 'ios-non-safari';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '인증에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google 로그인에 실패했습니다.');
    }
  };

  const handleAppleSignIn = async () => {
    try {
      await signInWithApple();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Apple 로그인에 실패했습니다.');
    }
  };

  // In-app browser: show external browser guide instead of login
  if (isInApp) {
    return (
      <div className="w-full max-w-sm mx-auto space-y-8">
        <div className="flex flex-col items-center gap-3">
          <Logo className="h-14 w-14" />
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">BrainDump</h1>
          </div>
        </div>

        <div className="text-center space-y-4">
          <div className="mx-auto w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
            <ExternalLink className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold">외부 브라우저에서 열어주세요</h2>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              현재 브라우저에서는 로그인과 앱 설치가
              <br />
              정상적으로 작동하지 않습니다.
            </p>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 text-left space-y-2">
            <p className="text-sm font-medium text-blue-900">앱으로 설치하면</p>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>- 홈 화면에서 바로 실행</li>
              <li>- 더 빠른 로딩 속도</li>
              <li>- 음성 입력, 공유 등 모든 기능 지원</li>
            </ul>
          </div>

          <Button
            className="w-full h-11"
            onClick={() => setInstallModalOpen(true)}
          >
            설치 방법 보기
          </Button>
        </div>

        <InstallGuideModal
          open={installModalOpen}
          onClose={() => setInstallModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto space-y-8">
      {/* Branding */}
      <div className="flex flex-col items-center gap-3">
        <Logo className="h-14 w-14" />
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">BrainDump</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isSignUp ? '새 계정을 만들어보세요' : '생각을 기록하면 AI가 정리합니다'}
          </p>
        </div>
      </div>

      {/* OAuth Buttons */}
      <div className="space-y-2.5">
        <Button
          variant="outline"
          className="w-full h-11"
          onClick={handleGoogleSignIn}
          type="button"
        >
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google로 계속하기
        </Button>

        <Button
          variant="outline"
          className="w-full h-11"
          onClick={handleAppleSignIn}
          type="button"
        >
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
          </svg>
          Apple로 계속하기
        </Button>
      </div>

      {/* Divider */}
      <div className="relative">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted-foreground">
          또는
        </span>
      </div>

      {/* Email Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="h-11"
        />
        <Input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="h-11"
        />
        {isSignUp && (
          <p className="text-xs text-muted-foreground">6자 이상 입력하세요</p>
        )}

        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}

        <Button type="submit" className="w-full h-11" disabled={loading}>
          {loading ? '처리 중...' : isSignUp ? '회원가입' : '로그인'}
        </Button>
      </form>

      {/* Toggle */}
      <p className="text-center text-sm text-muted-foreground">
        {isSignUp ? '이미 계정이 있으신가요?' : '계정이 없으신가요?'}{' '}
        <button
          type="button"
          className="text-foreground font-medium hover:underline underline-offset-4"
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError('');
          }}
        >
          {isSignUp ? '로그인' : '회원가입'}
        </button>
      </p>
      {/* Privacy */}
      <a
        href="/privacy"
        target="_blank"
        rel="noopener noreferrer"
        className="block text-center text-xs text-muted-foreground hover:underline underline-offset-4"
      >
        개인정보 처리방침
      </a>
    </div>
  );
}
