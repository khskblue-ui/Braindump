'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const RESEND_COOLDOWN_SECONDS = 60;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { requestPasswordReset } = useAuthStore();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const cooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timer on unmount to prevent setState after unmount
  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
    };
  }, []);

  function startCooldown() {
    setCooldown(RESEND_COOLDOWN_SECONDS);
    function tick(remaining: number) {
      if (remaining <= 0) return;
      cooldownTimerRef.current = setTimeout(() => {
        setCooldown(remaining - 1);
        tick(remaining - 1);
      }, 1000);
    }
    tick(RESEND_COOLDOWN_SECONDS);
  }

  const isEmailValid = email.includes('@') && email.includes('.') && email.length >= 5;

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setCodeSent(true);
      startCooldown();
      toast.success('인증 코드를 이메일로 발송했습니다.');
    } catch (err) {
      setError(err instanceof Error ? err.message : '이메일 발송에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || loading) return;
    setError('');
    setLoading(true);
    // Clear any running timer before starting a new cooldown
    if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
    try {
      await requestPasswordReset(email);
      startCooldown();
      toast.success('인증 코드를 다시 발송했습니다.');
    } catch (err) {
      setError(err instanceof Error ? err.message : '이메일 발송에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    // Pass email via sessionStorage instead of URL to avoid exposure
    // in browser history, server access logs, and Referer headers.
    try {
      sessionStorage.setItem('reset_email', email);
    } catch {
      // Storage quota exceeded or unavailable (private mode) — still proceed;
      // the reset-password page will ask the user to re-enter the email.
    }
    router.push('/reset-password');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 py-12">
      {/* Back link */}
      <div className="w-full max-w-sm mb-4">
        <a
          href="/login"
          className="text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-4 transition-colors"
        >
          ← 로그인으로
        </a>
      </div>

      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">비밀번호 찾기</CardTitle>
          <CardDescription className="whitespace-pre-line">
            {codeSent
              ? '이메일로 6자리 코드를 보냈습니다.\n스팸 폴더도 확인해 주세요.'
              : '가입하신 이메일 주소를 입력하세요.\n6자리 재설정 코드를 보내드립니다.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleRequest} className="space-y-3">
            <Input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="h-11"
            />

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}

            {!codeSent ? (
              <Button
                type="submit"
                className="w-full h-11"
                disabled={loading || !isEmailValid}
              >
                {loading ? '전송 중...' : '인증 코드 받기'}
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="w-full h-11"
                onClick={handleResend}
                disabled={cooldown > 0 || loading}
              >
                {loading
                  ? '전송 중...'
                  : cooldown > 0
                  ? `${cooldown}초 후 재시도 가능`
                  : '코드 재발송'}
              </Button>
            )}
          </form>

          {codeSent && (
            <Button
              className="w-full h-11"
              onClick={handleNext}
            >
              다음 단계로 →
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
