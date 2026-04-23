'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const RESET_EMAIL_KEY = 'reset_email';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { verifyPasswordResetOTP } = useAuthStore();

  const [email, setEmail] = useState('');
  const [hydrated, setHydrated] = useState(false);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load email from sessionStorage on mount.
  // If absent, redirect back to /forgot-password so the user starts the flow properly.
  useEffect(() => {
    let stored = '';
    try {
      stored = sessionStorage.getItem(RESET_EMAIL_KEY) ?? '';
    } catch {
      // sessionStorage unavailable (private mode) — fall through to redirect below.
    }
    if (!stored) {
      router.replace('/forgot-password');
      return;
    }
    setEmail(stored);
    setHydrated(true);
  }, [router]);

  const passwordMismatch =
    newPassword.length > 0 && confirmPassword.length > 0 && newPassword !== confirmPassword;

  const isFormValid =
    email.length > 0 &&
    code.length === 6 &&
    newPassword.length >= 6 &&
    newPassword === confirmPassword;

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Accept digits only, max 6 characters
    const digits = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(digits);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setError('');
    setLoading(true);
    try {
      await verifyPasswordResetOTP(email, code, newPassword);
      // Clear the stored email so the address isn't retained after success.
      try {
        sessionStorage.removeItem(RESET_EMAIL_KEY);
      } catch {
        // Storage cleanup failure is non-fatal; the session already reflects the new password.
      }
      toast.success('비밀번호가 변경되었습니다.');
      // verifyPasswordResetOTP establishes a live session — go straight to /home.
      // Sending to /login would trigger middleware to redirect again (already authenticated).
      router.push('/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : '비밀번호 재설정에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // Show a minimal loading state until we've checked sessionStorage.
  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground text-sm">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 py-12">
      {/* Back link */}
      <div className="w-full max-w-sm mb-4">
        <a
          href="/forgot-password"
          className="text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-4 transition-colors"
        >
          ← 이메일 다시 입력
        </a>
      </div>

      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">비밀번호 재설정</CardTitle>
          <CardDescription>
            이메일로 받은 6자리 코드와 새 비밀번호를 입력하세요.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Email — readonly, pre-filled from sessionStorage */}
            <Input
              type="email"
              placeholder="이메일"
              value={email}
              readOnly
              required
              className="h-11 bg-muted text-muted-foreground cursor-not-allowed"
            />

            {/* OTP code — digits only, max 6 */}
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="6자리 인증 코드"
              value={code}
              onChange={handleCodeChange}
              maxLength={6}
              required
              autoComplete="one-time-code"
              className="h-11 text-center tracking-widest font-mono text-lg"
            />

            {/* New password */}
            <Input
              type="password"
              placeholder="새 비밀번호 (6자 이상)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              className="h-11"
            />

            {/* Confirm new password */}
            <Input
              type="password"
              placeholder="새 비밀번호 확인"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              className="h-11"
            />

            {/* Inline mismatch warning */}
            {passwordMismatch && (
              <p className="text-sm text-amber-600">비밀번호가 일치하지 않습니다.</p>
            )}

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full h-11"
              disabled={loading || !isFormValid}
            >
              {loading ? '재설정 중...' : '비밀번호 재설정'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
