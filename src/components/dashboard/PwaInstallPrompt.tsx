'use client';

import { useState, useEffect } from 'react';
import { isStandalone } from '@/lib/browser-detect';
import { InstallGuideModal } from '@/components/landing/InstallGuideModal';
import { X, Zap } from 'lucide-react';

const DISMISS_KEY = 'braindump-pwa-prompt-dismissed';
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export function PwaInstallPrompt() {
  const [show, setShow] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    // Already running as PWA
    if (isStandalone()) return;

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

  return (
    <>
      {/* Banner */}
      {show && !modalOpen && (
        <div className="animate-slide-up bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl px-4 py-3 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <Zap className="h-5 w-5" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">앱으로 설치하면 더 빠릅니다</p>
              <p className="text-xs text-white/80 mt-0.5">
                홈 화면에서 바로 실행. 더 빠른 로딩과 오프라인 지원.
              </p>
              <button
                onClick={handleInstall}
                className="mt-2 bg-white text-blue-600 text-xs font-semibold px-4 py-1.5 rounded-full hover:bg-blue-50 transition-colors"
              >
                설치 방법 보기
              </button>
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
