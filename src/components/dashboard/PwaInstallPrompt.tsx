'use client';

import { useState, useEffect } from 'react';
import { isStandalone, detectBrowserContext, type BrowserContext } from '@/lib/browser-detect';
import { InstallGuideModal } from '@/components/landing/InstallGuideModal';
import { X, Zap, Smartphone } from 'lucide-react';

const DISMISS_KEY = 'braindump-pwa-prompt-dismissed';
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
const TESTFLIGHT_URL = 'https://testflight.apple.com/join/wuF7Bn8a';

export function PwaInstallPrompt() {
  const [show, setShow] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [browserCtx, setBrowserCtx] = useState<BrowserContext | null>(null);

  useEffect(() => {
    // Already running as PWA
    if (isStandalone()) return;

    setBrowserCtx(detectBrowserContext());

    // User dismissed recently
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed && Date.now() - Number(dismissed) < DISMISS_DURATION) return;

    // Show after a short delay so it doesn't feel jarring
    const timer = setTimeout(() => setShow(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  };

  const handleInstall = () => {
    setModalOpen(true);
  };

  if (!show && !modalOpen) return null;

  const isDesktop = browserCtx?.type === 'desktop';
  const isIOS = browserCtx?.type === 'ios-safari' || browserCtx?.type === 'ios-non-safari' ||
    (browserCtx?.type === 'inapp' && typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent));

  return (
    <>
      {/* Banner */}
      {show && !modalOpen && (
        <div className="animate-slide-up bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl px-4 py-3 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {isDesktop ? <Smartphone className="h-5 w-5" strokeWidth={2} /> : <Zap className="h-5 w-5" strokeWidth={2} />}
            </div>
            <div className="flex-1 min-w-0">
              {isDesktop ? (
                <>
                  <p className="text-sm font-semibold">iOS 앱도 있습니다</p>
                  <p className="text-xs text-white/80 mt-0.5">
                    모바일에서 음성 입력, 공유 등 더 많은 기능을 사용하세요.
                  </p>
                  <a
                    href={TESTFLIGHT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 bg-white text-blue-600 text-xs font-semibold px-4 py-1.5 rounded-full hover:bg-blue-50 transition-colors"
                  >
                    TestFlight에서 설치
                  </a>
                </>
              ) : isIOS ? (
                <>
                  <p className="text-sm font-semibold">네이티브 앱으로 더 빠르게</p>
                  <p className="text-xs text-white/80 mt-0.5">
                    전용 앱에서 음성 입력, 공유 등 모든 기능을 사용하세요.
                  </p>
                  <a
                    href={TESTFLIGHT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 bg-white text-blue-600 text-xs font-semibold px-4 py-1.5 rounded-full hover:bg-blue-50 transition-colors"
                  >
                    TestFlight에서 설치
                  </a>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold">홈 화면에 추가하세요</p>
                  <p className="text-xs text-white/80 mt-0.5">
                    홈 화면에서 바로 실행. 더 빠른 로딩 속도.
                  </p>
                  <button
                    onClick={handleInstall}
                    className="mt-2 bg-white text-blue-600 text-xs font-semibold px-4 py-1.5 rounded-full hover:bg-blue-50 transition-colors"
                  >
                    설치 방법 보기
                  </button>
                </>
              )}
            </div>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors"
              aria-label="닫기"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Reuse landing page install modal */}
      <InstallGuideModal open={modalOpen} onClose={() => {
        setModalOpen(false);
        handleDismiss();
      }} />
    </>
  );
}
