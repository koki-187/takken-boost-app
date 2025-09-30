// 宅建BOOST v9.0.0 Service Worker
// PWA Offline Support and Caching Strategy

const CACHE_NAME = 'takken-boost-v9.0.0';
const DYNAMIC_CACHE = 'takken-boost-dynamic-v9.0.0';

// Files to cache for offline use
const urlsToCache = [
    '/',
    '/index.html',
    '/static/app-v9.js',
    '/static/styles-v9.css',
    '/static/app-complete.js',
    '/static/styles-complete.css',
    '/manifest.json',
    '/icon-192x192.png',
    '/icon-512x512.png',
    // CDN resources that are critical for offline
    'https://cdn.tailwindcss.com',
    'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/three@0.157.0/build/three.module.js',
    'https://cdn.jsdelivr.net/npm/animejs@3.2.1/lib/anime.min.js',
    'https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js',
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js',
    'https://cdn.jsdelivr.net/npm/dayjs@1.11.10/dayjs.min.js'
];

// Install event - cache all static assets
self.addEventListener('install', event => {
    console.log('[ServiceWorker] Installing v9.0.0...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[ServiceWorker] Caching static assets');
                return cache.addAll(urlsToCache.map(url => {
                    return new Request(url, { mode: 'cors' });
                }));
            })
            .then(() => {
                console.log('[ServiceWorker] Static assets cached successfully');
                return self.skipWaiting(); // Activate immediately
            })
            .catch(err => {
                console.error('[ServiceWorker] Cache installation failed:', err);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('[ServiceWorker] Activating v9.0.0...');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // Delete old caches
                    if (cacheName !== CACHE_NAME && cacheName !== DYNAMIC_CACHE) {
                        console.log('[ServiceWorker] Removing old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('[ServiceWorker] v9.0.0 activated');
            return self.clients.claim(); // Take control immediately
        })
    );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Handle API requests differently (network first)
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(networkFirst(request));
        return;
    }

    // For navigation requests, try network first
    if (request.mode === 'navigate') {
        event.respondWith(networkFirst(request));
        return;
    }

    // For everything else, cache first
    event.respondWith(cacheFirst(request));
});

// Cache first strategy
async function cacheFirst(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            console.log('[ServiceWorker] Serving from cache:', request.url);
            return cachedResponse;
        }

        const networkResponse = await fetch(request);
        
        // Cache successful responses
        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
            console.log('[ServiceWorker] Added to dynamic cache:', request.url);
        }
        
        return networkResponse;
    } catch (error) {
        console.error('[ServiceWorker] Fetch failed:', error);
        
        // Return offline page if available
        const offlineResponse = await caches.match('/offline.html');
        if (offlineResponse) {
            return offlineResponse;
        }
        
        // Return a basic error response
        return new Response('Network error occurred', {
            status: 408,
            headers: { 'Content-Type': 'text/plain' }
        });
    }
}

// Network first strategy
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        
        // Cache successful responses
        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('[ServiceWorker] Network request failed, trying cache:', request.url);
        
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // For API requests, return error JSON
        if (request.url.includes('/api/')) {
            return new Response(
                JSON.stringify({
                    error: 'オフラインです。インターネット接続を確認してください。',
                    offline: true
                }),
                {
                    status: 503,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }
        
        // Return offline page or error
        const offlineResponse = await caches.match('/offline.html');
        if (offlineResponse) {
            return offlineResponse;
        }
        
        return new Response('Network error occurred', {
            status: 408,
            headers: { 'Content-Type': 'text/plain' }
        });
    }
}

// Background sync for offline actions
self.addEventListener('sync', event => {
    console.log('[ServiceWorker] Background sync triggered');
    
    if (event.tag === 'sync-progress') {
        event.waitUntil(syncProgress());
    }
});

async function syncProgress() {
    try {
        // Get offline progress data from IndexedDB
        const db = await openDB();
        const tx = db.transaction('offline-progress', 'readonly');
        const store = tx.objectStore('offline-progress');
        const allProgress = await store.getAll();
        
        // Sync each progress item
        for (const progress of allProgress) {
            await fetch('/api/study/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(progress)
            });
            
            // Remove synced item
            const deleteTx = db.transaction('offline-progress', 'readwrite');
            await deleteTx.objectStore('offline-progress').delete(progress.id);
        }
        
        console.log('[ServiceWorker] Progress synced successfully');
    } catch (error) {
        console.error('[ServiceWorker] Sync failed:', error);
    }
}

// Push notification support
self.addEventListener('push', event => {
    console.log('[ServiceWorker] Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : '新しい通知があります',
        icon: '/icon-192x192.png',
        badge: '/icon-72x72.png',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'view',
                title: '表示',
                icon: '/icon-check.png'
            },
            {
                action: 'close',
                title: '閉じる',
                icon: '/icon-close.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('宅建BOOST v9.0.0', options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', event => {
    console.log('[ServiceWorker] Notification clicked');
    event.notification.close();

    if (event.action === 'view') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Message handler for client communication
self.addEventListener('message', event => {
    console.log('[ServiceWorker] Message received:', event.data);
    
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
    
    if (event.data.action === 'clearCache') {
        event.waitUntil(
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
            }).then(() => {
                return event.ports[0].postMessage({ cleared: true });
            })
        );
    }
});

// Helper function to open IndexedDB
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('takken-boost-v9', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = event => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('offline-progress')) {
                db.createObjectStore('offline-progress', { keyPath: 'id', autoIncrement: true });
            }
        };
    });
}

// Cache size management
async function trimCache(cacheName, maxItems) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    if (keys.length > maxItems) {
        // Delete oldest entries
        const keysToDelete = keys.slice(0, keys.length - maxItems);
        for (const key of keysToDelete) {
            await cache.delete(key);
        }
        console.log(`[ServiceWorker] Trimmed ${keysToDelete.length} items from ${cacheName}`);
    }
}

// Periodically trim dynamic cache
setInterval(() => {
    trimCache(DYNAMIC_CACHE, 50);
}, 60000); // Every minute

console.log('[ServiceWorker] v9.0.0 loaded successfully');