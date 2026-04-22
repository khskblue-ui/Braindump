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

  // In-app browser or non-Safari iOS
  if (browserCtx.type === 'inapp' || browserCtx.type === 'ios-non-safari') {
    const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
    // iOS in-app: show App Store link directly
    if (isIOS) {
      return (
        <ModalShell onClose={onClose} title="앱 설치하기">
          <div className="px-6 pt-4 pb-8">
            <IOSGuide />
          </div>
        </ModalShell>
      );
    }
    // Android in-app: show web usage guide
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

/* ─── iOS Guide (App Store native app) ─── */

const APP_STORE_URL = 'https://apps.apple.com/kr/app/braindump/id6761980469';

function IOSGuide() {
  return (
    <div className="space-y-6">
      <div className="text-center py-2">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4">
          <svg viewBox="0 0 32 32" className="w-8 h-8">
            <path
              d="M10 8h6c2.2 0 4 1.8 4 4 0 1.5-.8 2.7-2 3.4 1.6.6 2.8 2.2 2.8 4.1 0 2.5-2 4.5-4.5 4.5H10V8z M13 11v3.5h2.5c1 0 1.7-.8 1.7-1.75S16.5 11 15.5 11H13z M13 17.5V21h3c1.1 0 2-.9 2-1.75s-.9-1.75-2-1.75H13z"
              fill="white"
            />
          </svg>
        </div>
        <h3 className="font-bold text-lg mb-2">iOS 앱을 설치하세요</h3>
        <p className="text-sm text-gray-500 leading-relaxed">
          네이티브 앱으로 더 빠르고 편리하게 사용할 수 있습니다.
          <br />
          음성 입력, 공유 등 모든 기능을 지원합니다.
        </p>
      </div>

      <a
        href={APP_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full flex items-center justify-center gap-2 bg-black text-white py-3.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
      >
        <Download className="h-4 w-4" />
        App Store에서 설치하기
      </a>

      <p className="text-xs text-center text-gray-400">
        App Store에서 바로 설치할 수 있습니다.
      </p>
    </div>
  );
}

/* ─── Android Guide ─── */

function AndroidGuide() {
  return (
    <div className="space-y-6">
      <div className="text-center py-2">
        <div className="mx-auto w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
            <line x1="12" y1="18" x2="12" y2="18" />
          </svg>
        </div>
        <h3 className="font-bold text-lg mb-2">Android 앱 준비 중</h3>
        <p className="text-sm text-gray-500 leading-relaxed">
          Android 전용 앱은 현재 개발 중입니다.
          <br />
          그동안 웹 브라우저에서 바로 사용하실 수 있습니다.
        </p>
      </div>

      <a
        href="/login"
        className="w-full flex items-center justify-center gap-2 bg-black text-white py-3.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
      >
        브라우저에서 바로 시작하기
      </a>

      <div className="border-t border-gray-100 pt-5">
        <p className="text-xs text-gray-400 mb-3">홈 화면에 바로가기를 추가할 수도 있습니다</p>
        <div className="space-y-4">
          <StepItem
            step={1}
            icon={
              <span className="flex items-center justify-center w-6 h-6 rounded bg-gray-100">
                <MoreVertical className="h-3.5 w-3.5 text-gray-600" />
              </span>
            }
            title="Chrome 메뉴 열기"
            description="우측 상단의 점 세 개(⋮) 메뉴를 탭하세요."
          />
          <StepItem
            step={2}
            icon={
              <span className="flex items-center justify-center w-6 h-6 rounded bg-blue-100">
                <Download className="h-3.5 w-3.5 text-blue-600" />
              </span>
            }
            title="홈 화면에 추가"
            description="'앱 설치' 또는 '홈 화면에 추가'를 탭하세요."
          />
        </div>
      </div>
    </div>
  );
}

/* ─── Desktop Guide ─── */

function DesktopGuide() {
  return (
    <div className="space-y-6">
      <div className="text-center py-2">
        <div className="mx-auto w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-4">
          <Check className="h-6 w-6 text-blue-600" />
        </div>
        <h3 className="font-bold text-lg mb-2">데스크탑에서 바로 사용 가능합니다</h3>
        <p className="text-sm text-gray-500 leading-relaxed">
          별도 설치 없이 이 브라우저에서 그대로 사용하세요.
          <br />
          로그인하면 모바일 앱과 데이터가 자동으로 동기화됩니다.
        </p>
      </div>

      <a
        href="/home"
        className="w-full flex items-center justify-center gap-2 bg-black text-white py-3.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
      >
        바로 사용하기
      </a>

      <div className="border-t border-gray-100 pt-5">
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs font-medium text-gray-500 mb-2">모바일 앱도 있습니다</p>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <svg viewBox="0 0 32 32" className="w-5 h-5">
                <path
                  d="M10 8h6c2.2 0 4 1.8 4 4 0 1.5-.8 2.7-2 3.4 1.6.6 2.8 2.2 2.8 4.1 0 2.5-2 4.5-4.5 4.5H10V8z M13 11v3.5h2.5c1 0 1.7-.8 1.7-1.75S16.5 11 15.5 11H13z M13 17.5V21h3c1.1 0 2-.9 2-1.75s-.9-1.75-2-1.75H13z"
                  fill="white"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">iOS 앱</p>
              <p className="text-xs text-gray-400">App Store 정식 출시</p>
            </div>
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 text-xs font-medium text-blue-600 hover:underline"
            >
              설치
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
