/* ============================================
   SERVICE WORKER - SADA Index
   ============================================ */

const CACHE_NAME = 'sada-index-v2';
const ASSETS = [
    '/',
    '/index.html',
    '/flat_lessons.json',
    '/css/01-theme.css',
    '/css/02-base.css',
    '/css/03-header.css',
    '/css/04-tabs.css',
    '/css/05-search.css',
    '/css/06-filters.css',
    '/css/07-results.css',
    '/css/08-pagination.css',
    '/css/09-books.css',
    '/css/10-guide-about.css',
    '/css/11-bookmarks.css',
    '/css/12-category-checkboxes.css',
    '/css/13-responsive.css',
    '/css/14-toast.css',
    '/css/15-sheikh-page.css',
    '/js/01-config.js',
    '/js/02-state.js',
    '/js/03-dom.js',
    '/js/04-category-helpers.js',
    '/js/05-book-index.js',
    '/js/06-filters.js',
    '/js/07-pagination.js',
    '/js/08-data-loader.js',
    '/js/09-tabs.js',
    '/js/10-dark-mode.js',
    '/js/11-clipboard.js',
    '/js/12-suggestions.js',
    '/js/13-url-params.js',
    '/js/14-bookmarks.js',
    '/js/15-category-checkboxes.js',
    '/js/16-page-title.js',
    '/js/app.js',
    'https://cdn.jsdelivr.net/npm/fuse.js@7.0.0'
];

// --- Install: cache all assets ---
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Caching assets...');
                return cache.addAll(ASSETS);
            })
            .then(() => {
                console.log('[SW] Assets cached successfully');
                return self.skipWaiting();
            })
    );
});

// --- Activate: clean up old caches ---
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cache => {
                        if (cache !== CACHE_NAME) {
                            console.log('[SW] Removing old cache:', cache);
                            return caches.delete(cache);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[SW] New service worker activated');
                return self.clients.claim();
            })
    );
});

// --- Fetch: serve from cache or network ---
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                // Return cached response if found
                if (cachedResponse) {
                    return cachedResponse;
                }

                // Otherwise fetch from network
                return fetch(event.request)
                    .then(response => {
                        // Don't cache non-GET requests or non-successful responses
                        if (!event.request.url.startsWith('http') ||
                            event.request.method !== 'GET' ||
                            !response.ok) {
                            return response;
                        }

                        // Clone response and cache it
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseClone);
                            });

                        return response;
                    })
                    .catch(() => {
                        // Offline fallback – show a generic message
                        return new Response('🔌 غير متصل بالإنترنت. يرجى التحقق من الاتصال.', {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: new Headers({ 'Content-Type': 'text/plain; charset=utf-8' })
                        });
                    });
            })
    );
});
