// 宅建BOOST v9.0.0 Ultimate Edition - Service Worker
const CACHE_NAME = 'takken-boost-v9.0.0';
const urlsToCache = [
  '/',
  '/static/styles-v9.css',
  '/static/app-v9.js',
  '/static/darkmode.js',
  '/static/text-to-speech.js',
  '/static/3d-logo.js',
  '/static/animations.js',
  '/manifest.json',
  '/favicon.ico',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/three@0.157.0/build/three.min.js',
  'https://cdn.jsdelivr.net/npm/animejs@3.2.1/lib/anime.min.js',
  'https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// Install event - cache assets
self.addEventListener('install', event => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[ServiceWorker] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('[ServiceWorker] Failed to cache:', err);
      })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activate');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName.startsWith('takken-boost-')) {
            console.log('[ServiceWorker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all clients as soon as active
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  const { request } = event;
  
  // Skip cross-origin requests
  if (!request.url.startsWith(self.location.origin) && 
      !request.url.includes('cdn.tailwindcss.com') &&
      !request.url.includes('cdn.jsdelivr.net')) {
    return;
  }
  
  // Handle API requests differently (network first)
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Clone the response before caching
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseToCache);
          });
          
          return response;
        })
        .catch(() => {
          // If network fails, try cache
          return caches.match(request);
        })
    );
    return;
  }
  
  // For other requests, cache first strategy
  event.respondWith(
    caches.match(request)
      .then(response => {
        if (response) {
          // Return cached version
          return response;
        }
        
        // Not in cache, fetch from network
        return fetch(request).then(response => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone the response
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseToCache);
          });
          
          return response;
        });
      })
      .catch(error => {
        console.error('[ServiceWorker] Fetch failed:', error);
        
        // Provide offline fallback for navigation requests
        if (request.mode === 'navigate') {
          return caches.match('/');
        }
      })
  );
});

// Handle background sync
self.addEventListener('sync', event => {
  console.log('[ServiceWorker] Background sync:', event.tag);
  
  if (event.tag === 'sync-progress') {
    event.waitUntil(syncProgress());
  }
});

// Sync progress data
async function syncProgress() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const requests = await cache.keys();
    
    // Find API requests that need syncing
    const apiRequests = requests.filter(req => 
      req.url.includes('/api/') && req.method === 'POST'
    );
    
    // Retry failed API calls
    for (const request of apiRequests) {
      try {
        const response = await fetch(request);
        if (response.ok) {
          // Remove from cache if successful
          await cache.delete(request);
        }
      } catch (error) {
        console.error('[ServiceWorker] Sync failed for:', request.url);
      }
    }
  } catch (error) {
    console.error('[ServiceWorker] Sync error:', error);
  }
}

// Handle push notifications
self.addEventListener('push', event => {
  console.log('[ServiceWorker] Push received');
  
  const options = {
    body: event.data ? event.data.text() : '新しい学習コンテンツが利用可能です',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: '学習を開始',
        icon: '/check.png'
      },
      {
        action: 'close',
        title: '閉じる',
        icon: '/cross.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('宅建BOOST v9.0.0', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('[ServiceWorker] Notification click received');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    // Open study page
    event.waitUntil(
      clients.openWindow('/study')
    );
  } else {
    // Open home page
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Periodic background sync for regular updates
self.addEventListener('periodicsync', event => {
  if (event.tag === 'update-questions') {
    event.waitUntil(updateQuestions());
  }
});

async function updateQuestions() {
  try {
    const response = await fetch('/api/study/questions?category=all');
    if (response.ok) {
      const data = await response.json();
      console.log('[ServiceWorker] Questions updated:', data.questions.length);
      
      // Cache the updated questions
      const cache = await caches.open(CACHE_NAME);
      await cache.put('/api/study/questions?category=all', response);
    }
  } catch (error) {
    console.error('[ServiceWorker] Failed to update questions:', error);
  }
}

// Message handler for skip waiting
self.addEventListener('message', event => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});