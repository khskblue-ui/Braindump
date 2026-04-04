'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Share, PlusSquare, MoreVertical, Download, Check, Copy, ExternalLink } from 'lucide-react';
import { detectBrowserContext, isStandalone, type BrowserContext } from '@/lib/browser-detect';

interface InstallGuideModalProps {
  open: boolean;
  onClose: () => void;
}

export function InstallGuideModal({ open, onClose }: InstallGuideModalProps) {
  const [browserCtx, setBrowserCtx] = useState<BrowserContext>({ type: 'desktop' });
  const [installed, setInstalled] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setBrowserCtx(detectBrowserContext());
    setInstalled(isStandalone());
  }, []);

  if (!open) return null;

  if (installed) {
    return (
      <ModalShell onClose={onClose}>
        <div className="text-center pt-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="text-xl font-bold mb-2">이미 설치되어 있습니다</h2>
          <p className="text-sm text-gray-500 mb-6">
            BrainDump가 홈 화면에 설치되어 있습니다.
          </p>
          <a
            href="/login"
            className="inline-flex items-center gap-2 bg-black text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            로그인하러 가기
          </a>
        </div>
      </ModalShell>
    );
  }

  // In-app browser or non-Safari iOS → redirect to external browser
  if (browserCtx.type === 'inapp' || browserCtx.type === 'ios-non-safari') {
    return (
      <ModalShell onClose={onClose}>
        <div className="px-6 pt-4 pb-8">
          <InAppGuide browserCtx={browserCtx} copied={copied} setCopied={setCopied} />
        </div>
      </ModalShell>
    );
  }

  // Normal Safari / Android Chrome / Desktop
  return (
    <ModalShell onClose={onClose} title="앱 설치하기">
      <div className="px-6 pt-4 pb-8">
        {browserCtx.type === 'ios-safari' && <IOSGuide />}
        {browserCtx.type === 'android' && <AndroidGuide />}
        {browserCtx.type === 'desktop' && <DesktopGuide />}

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400 mb-3">이미 설치하셨나요?</p>
          <a
            href="/login"
            className="text-sm font-medium text-black underline underline-offset-4"
          >
            로그인하러 가기
          </a>
        </div>
      </div>
    </ModalShell>
  );
}

/* ─── Modal Shell ─── */

function ModalShell({
  children,
  onClose,
  title,
}: {
  children: React.ReactNode;
  onClose: () => void;
  title?: string;
}) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md mx-auto z-10 max-h-[85vh] overflow-y-auto text-left">
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-100 px-6 py-4 flex items-center justify-between z-20">
          <h2 className="text-lg font-bold">{title || '앱 설치하기'}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}

/* ─── In-App Browser / Non-Safari iOS Guide ─── */

function InAppGuide({
  browserCtx,
  copied,
  setCopied,
}: {
  browserCtx: BrowserContext;
  copied: boolean;
  setCopied: (v: boolean) => void;
}) {
  const isKakao = browserCtx.type === 'inapp' && browserCtx.brand === 'kakaotalk';
  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
  const targetBrowser = isIOS ? 'Safari' : 'Chrome';

  const handleOpenExternal = () => {
    if (isKakao) {
      window.location.href =
        'kakaotalk://web/openExternal?url=' + encodeURIComponent(window.location.href);
    }
  };

  const handleCopy = async () => {
    const url = window.location.href;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      } else {
        const el = document.createElement('textarea');
        el.value = url;
        el.style.position = 'fixed';
        el.style.opacity = '0';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silent fail
    }
  };

  const brandName =
    browserCtx.type === 'inapp'
      ? {
          kakaotalk: '카카오톡',
          naver: '네이버 앱',
          line: 'LINE',
          facebook: 'Facebook',
          instagram: 'Instagram',
          unknown: '현재 브라우저',
        }[browserCtx.brand]
      : '현재 브라우저';

  return (
    <div className="space-y-6">
      <div className="text-center py-2">
        <div className="mx-auto w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mb-4">
          <ExternalLink className="h-6 w-6 text-amber-600" />
        </div>
        <h3 className="font-bold text-lg mb-2">
          {targetBrowser}에서 열어주세요
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed">
          {brandName}에서는 앱 설치가 지원되지 않습니다.
          <br />
          {targetBrowser}에서 열면 홈 화면에 추가할 수 있습니다.
        </p>
      </div>

      {/* KakaoTalk: one-click open */}
      {isKakao && (
        <button
          onClick={handleOpenExternal}
          className="w-full flex items-center justify-center gap-2 bg-black text-white py-3.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          {targetBrowser}에서 열기
        </button>
      )}

      {/* Other in-app / non-Safari: copy URL */}
      {!isKakao && (
        <div className="space-y-3">
          <StepItem
            step={1}
            icon={
              <span className="flex items-center justify-center w-6 h-6 rounded bg-gray-100">
                <Copy className="h-3.5 w-3.5 text-gray-600" />
              </span>
            }
            title="주소 복사하기"
            description="아래 버튼을 눌러 주소를 복사하세요."
          />
          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                복사 완료!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                주소 복사하기
              </>
            )}
          </button>

          <StepItem
            step={2}
            icon={
              <span className="flex items-center justify-center w-6 h-6 rounded bg-blue-100">
                <ExternalLink className="h-3.5 w-3.5 text-blue-600" />
              </span>
            }
            title={`${targetBrowser}에서 열기`}
            description={`${targetBrowser}를 열고 주소창에 붙여넣기 하세요.`}
          />

          <StepItem
            step={3}
            icon={
              <span className="flex items-center justify-center w-6 h-6 rounded bg-green-100">
                <Download className="h-3.5 w-3.5 text-green-600" />
              </span>
            }
            title="앱 설치하기"
            description={`${targetBrowser}에서 열면 앱을 홈 화면에 설치할 수 있습니다.`}
          />
        </div>
      )}

      <div className="bg-gray-50 rounded-xl p-4 text-center">
        <p className="text-xs text-gray-400 mb-1">접속 주소</p>
        <p className="text-sm font-mono font-medium text-gray-700">
          {typeof window !== 'undefined' ? window.location.host : 'braindump-jet.vercel.app'}
        </p>
      </div>
    </div>
  );
}

/* ─── Step Item ─── */

function StepItem({
  step,
  icon,
  title,
  description,
}: {
  step: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold">
        {step}
      </div>
      <div className="flex-1 pt-0.5">
        <div className="flex items-center gap-2 mb-1">
          {icon}
          <h3 className="font-semibold text-sm">{title}</h3>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

/* ─── iOS Safari Guide ─── */

function IOSGuide() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">
        Safari에서 아래 단계를 따라해 주세요.
      </p>

      <StepItem
        step={1}
        icon={
          <span className="flex items-center justify-center w-6 h-6 rounded bg-blue-100">
            <Share className="h-3.5 w-3.5 text-blue-600" />
          </span>
        }
        title="공유 버튼 탭"
        description="Safari 하단의 공유 버튼(네모에서 화살표가 나오는 아이콘)을 탭하세요."
      />

      <StepItem
        step={2}
        icon={
          <span className="flex items-center justify-center w-6 h-6 rounded bg-gray-100">
            <PlusSquare className="h-3.5 w-3.5 text-gray-600" />
          </span>
        }
        title="홈 화면에 추가"
        description="목록을 스크롤해서 '홈 화면에 추가'를 찾아 탭하세요."
      />

      <StepItem
        step={3}
        icon={
          <span className="flex items-center justify-center w-6 h-6 rounded bg-green-100">
            <Check className="h-3.5 w-3.5 text-green-600" />
          </span>
        }
        title="추가 완료"
        description="오른쪽 상단의 '추가'를 탭하면 홈 화면에 BrainDump 앱이 생깁니다."
      />
    </div>
  );
}

/* ─── Android Chrome Guide ─── */

function AndroidGuide() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">
        Chrome에서 아래 단계를 따라해 주세요.
      </p>

      <StepItem
        step={1}
        icon={
          <span className="flex items-center justify-center w-6 h-6 rounded bg-gray-100">
            <MoreVertical className="h-3.5 w-3.5 text-gray-600" />
          </span>
        }
        title="메뉴 열기"
        description="Chrome 우측 상단의 점 세 개(⋮) 메뉴를 탭하세요."
      />

      <StepItem
        step={2}
        icon={
          <span className="flex items-center justify-center w-6 h-6 rounded bg-blue-100">
            <Download className="h-3.5 w-3.5 text-blue-600" />
          </span>
        }
        title="앱 설치 또는 홈 화면에 추가"
        description="'앱 설치' 또는 '홈 화면에 추가'를 탭하세요. 설치 확인 팝업이 나타나면 '설치'를 누르세요."
      />

      <StepItem
        step={3}
        icon={
          <span className="flex items-center justify-center w-6 h-6 rounded bg-green-100">
            <Check className="h-3.5 w-3.5 text-green-600" />
          </span>
        }
        title="설치 완료"
        description="홈 화면에 BrainDump 앱이 추가됩니다. 탭해서 바로 실행하세요."
      />
    </div>
  );
}

/* ─── Desktop Guide ─── */

function DesktopGuide() {
  return (
    <div className="space-y-6">
      <div className="text-center py-4">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
          <svg viewBox="0 0 32 32" className="w-8 h-8">
            <defs>
              <linearGradient id="install-logo" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#7C3AED" />
              </linearGradient>
            </defs>
            <rect width="32" height="32" rx="7" fill="url(#install-logo)" />
            <path
              d="M10 8h6c2.2 0 4 1.8 4 4 0 1.5-.8 2.7-2 3.4 1.6.6 2.8 2.2 2.8 4.1 0 2.5-2 4.5-4.5 4.5H10V8z M13 11v3.5h2.5c1 0 1.7-.8 1.7-1.75S16.5 11 15.5 11H13z M13 17.5V21h3c1.1 0 2-.9 2-1.75s-.9-1.75-2-1.75H13z"
              fill="white"
            />
          </svg>
        </div>
        <h3 className="font-bold text-lg mb-2">모바일에서 설치하세요</h3>
        <p className="text-sm text-gray-500 leading-relaxed">
          BrainDump는 모바일에 최적화된 앱입니다.
          <br />
          스마트폰으로 이 페이지에 접속한 뒤 설치해 주세요.
        </p>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 text-center">
        <p className="text-xs text-gray-400 mb-2">접속 주소</p>
        <p className="text-sm font-mono font-medium text-gray-700">
          braindump-jet.vercel.app
        </p>
      </div>
    </div>
  );
}
