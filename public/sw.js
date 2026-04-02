const CACHE_NAME = 'braindump-v3';
const STATIC_CACHE = 'braindump-static-v3';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
];

// Install: cache static assets into STATIC_CACHE (M6: consistent cache naming)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== STATIC_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch: tiered caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip navigation requests — let the server/proxy handle redirects
  if (request.mode === 'navigate') return;

  // H6: API calls and Supabase requests: Network Only with offline fallback
  if (url.pathname.startsWith('/api/') || url.hostname.includes('supabase.co')) {
    event.respondWith(
      fetch(request).catch(() =>
        new Response(
          JSON.stringify({ error: '오프라인 상태입니다.' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        )
      )
    );
    return;
  }

  // Cache First for immutable hashed Next.js static assets
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.open(STATIC_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request).then((response) => {
            if (response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          });
        })
      )
    );
    return;
  }

  // Stale-while-revalidate for other same-origin assets
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(request).then((cached) => {
          const networkFetch = fetch(request)
            .then((response) => {
              if (response.ok) {
                cache.put(request, response.clone());
              }
              return response;
            })
            .catch(() => {
              // Offline fallback: return cached or error
              if (cached) return cached;
              return new Response('Offline', { status: 503 });
            });
          return cached || networkFetch;
        })
      )
    );
  }
});
