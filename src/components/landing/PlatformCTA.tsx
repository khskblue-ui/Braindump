'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { detectBrowserContext, type BrowserContext } from '@/lib/browser-detect';
import { Smartphone, Monitor, ArrowRight, Apple } from 'lucide-react';

interface PlatformCTAProps {
  variant?: 'default' | 'large';
}

const APP_STORE_URL = 'https://apps.apple.com/kr/app/braindump/id6761980469';

export function PlatformCTA({ variant = 'default' }: PlatformCTAProps) {
  const [ctx, setCtx] = useState<BrowserContext | null>(null);

  useEffect(() => {
    setCtx(detectBrowserContext());
  }, []);

  // SSR / loading: show desktop default
  if (!ctx) {
    return <DesktopCTA variant={variant} />;
  }

  const isIOS =
    ctx.type === 'ios-safari' ||
    ctx.type === 'ios-non-safari' ||
    (ctx.type === 'inapp' && typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent));

  const isAndroid =
    ctx.type === 'android' ||
    (ctx.type === 'inapp' && typeof navigator !== 'undefined' && /Android/.test(navigator.userAgent));

  if (isIOS) return <IOSCTA variant={variant} />;
  if (isAndroid) return <AndroidCTA variant={variant} />;
  return <DesktopCTA variant={variant} />;
}

/* ─── iOS CTA ─── */
function IOSCTA({ variant }: { variant: 'default' | 'large' }) {
  const isLarge = variant === 'large';

  return (
    <div className="flex flex-col items-center gap-3">
      <a
        href={APP_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-2.5 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors ${
          isLarge ? 'px-10 py-4 text-base' : 'px-8 py-3.5 text-sm'
        }`}
      >
        <Apple className="h-5 w-5" fill="currentColor" strokeWidth={0} />
        App Store에서 다운로드
        <ArrowRight className="h-4 w-4" />
      </a>
      <p className={`text-gray-400 ${isLarge ? 'text-sm' : 'text-xs'}`}>
        무료 · App Store
      </p>
    </div>
  );
}

/* ─── Android CTA ─── */
function AndroidCTA({ variant }: { variant: 'default' | 'large' }) {
  const isLarge = variant === 'large';

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Android notice */}
        <div
          className={`inline-flex items-center gap-2 bg-gray-100 text-gray-400 rounded-full font-medium cursor-default ${
            isLarge ? 'px-8 py-4 text-base' : 'px-6 py-3 text-sm'
          }`}
        >
          <Smartphone className="h-4 w-4" />
          Android 앱 준비 중
        </div>
        {/* Desktop web alternative */}
        <Link
          href="/login"
          className={`inline-flex items-center gap-2 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors ${
            isLarge ? 'px-8 py-4 text-base' : 'px-6 py-3 text-sm'
          }`}
        >
          <Monitor className="h-4 w-4" />
          데스크탑에서 시작하기
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <p className={`text-gray-400 text-center ${isLarge ? 'text-sm' : 'text-xs'}`}>
        데스크탑 브라우저에서 바로 사용할 수 있습니다
      </p>
    </div>
  );
}

/* ─── Desktop CTA ─── */
function DesktopCTA({ variant }: { variant: 'default' | 'large' }) {
  const isLarge = variant === 'large';

  return (
    <div className="flex flex-col items-center gap-3">
      <Link
        href="/login"
        className={`inline-flex items-center gap-2 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors ${
          isLarge ? 'px-10 py-4 text-base' : 'px-8 py-3.5 text-sm'
        }`}
      >
        <Monitor className="h-4 w-4" />
        브라우저에서 바로 시작
        <ArrowRight className="h-4 w-4" />
      </Link>
      <p className={`text-gray-400 ${isLarge ? 'text-sm' : 'text-xs'}`}>
        무료 · 가입 즉시 사용 · 설치 불필요
      </p>
    </div>
  );
}

/* ─── Platform Cards (for bottom CTA section) ─── */
export function PlatformCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
      {/* iOS */}
      <a
        href={APP_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex flex-col items-center gap-3 p-6 rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all"
      >
        <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center">
          <Apple className="h-6 w-6 text-white" fill="white" strokeWidth={0} />
        </div>
        <div className="text-center">
          <h3 className="font-bold text-sm">iOS 앱</h3>
          <p className="text-xs text-gray-400 mt-1">App Store</p>
        </div>
        <span className="text-xs font-medium text-blue-600 group-hover:underline">
          참여하기 →
        </span>
      </a>

      {/* Desktop */}
      <Link
        href="/login"
        className="group flex flex-col items-center gap-3 p-6 rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all"
      >
        <div className="w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center">
          <Monitor className="h-6 w-6 text-white" />
        </div>
        <div className="text-center">
          <h3 className="font-bold text-sm">데스크탑 웹</h3>
          <p className="text-xs text-gray-400 mt-1">바로 사용 가능</p>
        </div>
        <span className="text-xs font-medium text-blue-600 group-hover:underline">
          시작하기 →
        </span>
      </Link>

      {/* Android */}
      <div className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-gray-100 bg-gray-50">
        <div className="w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center">
          <Smartphone className="h-6 w-6 text-gray-400" />
        </div>
        <div className="text-center">
          <h3 className="font-bold text-sm text-gray-400">Android</h3>
          <p className="text-xs text-gray-300 mt-1">개발 중</p>
        </div>
        <span className="text-xs font-medium text-gray-300">
          곧 출시
        </span>
      </div>
    </div>
  );
}
