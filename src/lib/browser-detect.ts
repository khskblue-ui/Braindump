export type BrowserContext =
  | { type: 'inapp'; brand: 'kakaotalk' | 'naver' | 'line' | 'facebook' | 'instagram' | 'unknown' }
  | { type: 'ios-non-safari' }
  | { type: 'ios-safari' }
  | { type: 'android' }
  | { type: 'desktop' };

function isTrueSafariOnIOS(ua: string): boolean {
  return (
    /Safari\//.test(ua) &&
    !/CriOS\//.test(ua) &&
    !/FxiOS\//.test(ua) &&
    !/EdgA\/|EdgiOS\//.test(ua) &&
    !/OPiOS\//.test(ua) &&
    !/DuckDuckGo\//.test(ua)
  );
}

export function detectBrowserContext(): BrowserContext {
  if (typeof navigator === 'undefined') return { type: 'desktop' };
  const ua = navigator.userAgent;

  // In-app browsers (priority order)
  if (/KAKAOTALK/i.test(ua)) return { type: 'inapp', brand: 'kakaotalk' };
  if (/NAVER\(inapp/i.test(ua)) return { type: 'inapp', brand: 'naver' };
  if (/Line\//i.test(ua)) return { type: 'inapp', brand: 'line' };
  if (/Instagram/i.test(ua)) return { type: 'inapp', brand: 'instagram' };
  if (/FBAN\/|FBAV\//i.test(ua)) return { type: 'inapp', brand: 'facebook' };

  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isAndroid = /Android/.test(ua);

  // Generic in-app on Android (no Chrome, no Samsung, no Firefox = likely in-app webview)
  if (isAndroid && !/Chrome\//.test(ua) && !/SamsungBrowser\//.test(ua) && !/Firefox\//.test(ua)) {
    return { type: 'inapp', brand: 'unknown' };
  }

  // iOS: check if true Safari
  if (isIOS) {
    return isTrueSafariOnIOS(ua) ? { type: 'ios-safari' } : { type: 'ios-non-safari' };
  }

  // Android with Chrome/Samsung/Firefox
  if (isAndroid) return { type: 'android' };

  return { type: 'desktop' };
}

export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}
