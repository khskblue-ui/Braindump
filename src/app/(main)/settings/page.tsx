'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, LogOut, Trash2, Save, Brain, ChevronRight, BookOpen, History, ListChecks, FileText, ExternalLink, Mail, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

const FEEDBACK_EMAIL = 'lifescienkhs@naver.com';

/** Build the mailto: URL with a Korean feedback template + runtime browser info. */
function buildMailtoUrl(): string {
  const subject = encodeURIComponent('BrainDump 의견');
  const body = encodeURIComponent(
    `(여기에 의견을 적어주세요)\n\n\n---\n아래 정보는 문제 진단에 참고됩니다. 필요 없으면 삭제하세요.\n\n브라우저: ${navigator.userAgent}\n화면: ${window.innerWidth} x ${window.innerHeight}\n페이지: ${window.location.href}\n시간: ${new Date().toISOString()}`
  );
  return `mailto:${FEEDBACK_EMAIL}?subject=${subject}&body=${body}`;
}

/** Copy text to clipboard with textarea fallback for environments without Clipboard API. */
async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
    return;
  }
  // Fallback: textarea + execCommand (same pattern as InstallGuideModal)
  const el = document.createElement('textarea');
  el.value = text;
  el.style.position = 'fixed';
  el.style.opacity = '0';
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
}

const PURGE_OPTIONS = [
  { value: 7, label: '7일' },
  { value: 14, label: '14일' },
  { value: 30, label: '30일' },
  { value: 0, label: '사용 안 함' },
];

export default function SettingsPage() {
  const { user, signOut } = useAuthStore();
  const [autoPurgeDays, setAutoPurgeDays] = useState<number>(30);
  const [savedValue, setSavedValue] = useState<number>(30);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  // Default mailto uses only the recipient; useEffect upgrades it with runtime browser info
  // post-hydration to avoid SSR/CSR mismatch on `navigator`/`window` access.
  const [mailtoUrl, setMailtoUrl] = useState(`mailto:${FEEDBACK_EMAIL}`);

  useEffect(() => {
    setMailtoUrl(buildMailtoUrl());
  }, []);

  const hasChanges = autoPurgeDays !== savedValue;

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings?.auto_purge_days !== undefined) {
          setAutoPurgeDays(data.settings.auto_purge_days);
          setSavedValue(data.settings.auto_purge_days);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCopyEmail = async () => {
    try {
      await copyToClipboard(FEEDBACK_EMAIL);
      setEmailCopied(true);
      toast.success('이메일 주소를 복사했어요.');
      setTimeout(() => setEmailCopied(false), 2000);
    } catch {
      toast.error('복사에 실패했어요. 주소를 직접 선택해 복사해주세요.');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auto_purge_days: autoPurgeDays }),
      });
      if (!res.ok) throw new Error();
      setSavedValue(autoPurgeDays);
      toast.success('설정이 저장되었습니다.');
    } catch {
      toast.error('설정 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold flex items-center gap-2">
        <Settings className="h-5 w-5" strokeWidth={1.5} /> 설정
      </h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">계정 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm text-muted-foreground">이메일</label>
            <p className="text-sm font-medium">{user?.email || '-'}</p>
          </div>
          <Button variant="destructive" size="sm" onClick={signOut} className="gap-1.5">
            <LogOut className="h-4 w-4" strokeWidth={1.5} />
            로그아웃
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="h-4 w-4" strokeWidth={1.5} /> AI 자동 분류
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <Link href="/settings/classify-patterns" className="flex items-center justify-between py-2.5 hover:bg-accent rounded-md px-2 -mx-2 transition-colors">
            <div className="flex items-center gap-2.5">
              <History className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
              <span className="text-sm">나의 교정 이력</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          </Link>
          <Link href="/settings/classify-rules" className="flex items-center justify-between py-2.5 hover:bg-accent rounded-md px-2 -mx-2 transition-colors">
            <div className="flex items-center gap-2.5">
              <ListChecks className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
              <span className="text-sm">나의 분류 규칙</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Trash2 className="h-4 w-4" strokeWidth={1.5} /> 휴지통 설정
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm text-muted-foreground block mb-1.5">
              자동 비우기
            </label>
            <select
              value={autoPurgeDays}
              onChange={(e) => setAutoPurgeDays(Number(e.target.value))}
              disabled={loading}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {PURGE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground mt-1.5">
              삭제된 항목이 자동으로 영구 삭제되는 기간을 설정합니다.
            </p>
          </div>

          <Button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            size="sm"
            className="w-full gap-1.5"
          >
            <Save className="h-4 w-4" strokeWidth={1.5} />
            {saving ? '저장 중...' : '저장'}
          </Button>
        </CardContent>
      </Card>
      {/* 도움말 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4" strokeWidth={1.5} /> 도움말
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <a
            href="/guide"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between py-2.5 hover:bg-accent rounded-md px-2 -mx-2 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <FileText className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
              <span className="text-sm">사용 가이드</span>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          </a>

          {/* Feedback: open default mail app via mailto: */}
          <a
            href={mailtoUrl}
            rel="noopener"
            className="flex items-center justify-between py-2.5 hover:bg-accent rounded-md px-2 -mx-2 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
              <span className="text-sm">개발자에게 의견 보내기</span>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          </a>

          {/* Email copy fallback for environments without a mail app */}
          <div className="px-2 -mx-2 py-2.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Copy className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                <span className="text-sm text-muted-foreground font-mono">{FEEDBACK_EMAIL}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyEmail}
                className="h-7 px-2 gap-1 text-xs"
              >
                {emailCopied ? (
                  <>
                    <Check className="h-3.5 w-3.5" strokeWidth={1.5} />
                    복사됨
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" strokeWidth={1.5} />
                    복사
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              메일 앱이 열리지 않으면 아래 주소를 복사해 사용해주세요.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 계정 관리 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">계정 관리</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <a
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between py-2.5 hover:bg-accent rounded-md px-2 -mx-2 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Settings className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
              <span className="text-sm">개인정보 처리방침</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
