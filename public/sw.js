// BarberX PWA Service Worker v1.0.0
const CACHE_NAME = 'barberx-pwa-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/pwa-192x192.svg',
  '/pwa-512x512.svg'
];

// 1. Install Event: Cache core shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching BarberX App Shell');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// 2. Activate Event: Cleanup stale caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event: Stale-While-Revalidate Strategy with Network Fallback
self.addEventListener('fetch', (event) => {
  // Ignore non-GET requests or external API extensions
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          // Check if valid response
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If network fails and no cache exists, return offline fallback message
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/index.html');
          }
        });

      return cachedResponse || fetchPromise;
    })
  );
});

// 4. Push Notifications Event
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'BarberX', body: 'Lembrete de agendamento em 15 minutos!' };
  
  const options = {
    body: data.body,
    icon: '/pwa-192x192.svg',
    badge: '/pwa-192x192.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      { action: 'confirm', title: 'Confirmar Presença' },
      { action: 'close', title: 'Fechar' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 5. Background Sync Event (Sync offline bookings when internet restores)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-appointments') {
    console.log('[ServiceWorker] Sincronizando agendamentos offline com Supabase...');
    event.waitUntil(
      // Simulated sync logic
      Promise.resolve()
    );
  }
});
