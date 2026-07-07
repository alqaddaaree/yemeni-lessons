/* ============================================
   SERVICE WORKER - SADA Index
   ============================================ */

const CACHE_NAME = 'sada-index-v3';
const ASSETS = [
    '/yemeni-lessons/',
    '/yemeni-lessons/index.html',
    '/yemeni-lessons/flat_lessons.json',
    '/yemeni-lessons/css/01-theme.css',
    '/yemeni-lessons/css/02-base.css',
    '/yemeni-lessons/css/03-header.css',
    '/yemeni-lessons/css/04-tabs.css',
    '/yemeni-lessons/css/05-search.css',
    '/yemeni-lessons/css/06-filters.css',
    '/yemeni-lessons/css/07-results.css',
    '/yemeni-lessons/css/08-pagination.css',
    '/yemeni-lessons/css/09-books.css',
    '/yemeni-lessons/css/10-guide-about.css',
    '/yemeni-lessons/css/11-bookmarks.css',
    '/yemeni-lessons/css/12-category-checkboxes.css',
    '/yemeni-lessons/css/13-responsive.css',
    '/yemeni-lessons/css/14-toast.css',
    '/yemeni-lessons/css/15-sheikh-page.css',
    '/yemeni-lessons/js/01-config.js',
    '/yemeni-lessons/js/02-state.js',
    '/yemeni-lessons/js/03-dom.js',
    '/yemeni-lessons/js/04-category-helpers.js',
    '/yemeni-lessons/js/05-book-index.js',
    '/yemeni-lessons/js/06-filters.js',
    '/yemeni-lessons/js/07-pagination.js',
    '/yemeni-lessons/js/08-data-loader.js',
    '/yemeni-lessons/js/09-tabs.js',
    '/yemeni-lessons/js/10-dark-mode.js',
    '/yemeni-lessons/js/11-clipboard.js',
    '/yemeni-lessons/js/12-suggestions.js',
    '/yemeni-lessons/js/14-bookmarks.js',
    '/yemeni-lessons/js/15-category-checkboxes.js',
    '/yemeni-lessons/js/16-page-title.js',
    '/yemeni-lessons/js/17-service-worker.js',
    '/yemeni-lessons/js/app.js',
    'https://cdn.jsdelivr.net/npm/fuse.js@7.0.0'
];

// ... rest of sw.js stays the same ...

// --- Install: cache all assets ---
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(ASSETS);
            })
            .then(() => {
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
                            return caches.delete(cache);
                        }
                    })
                );
            })
            .then(() => {
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
