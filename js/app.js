/* ============================================
   SADA INDEX - Main Application
   ============================================
   This file imports all modules and starts the app.
   All functions are globally available via script tags.
   ============================================ */

// --- All modules are loaded via script tags in HTML ---
// The order in HTML must be:
// 01-config.js
// 02-state.js
// 03-dom.js
// 04-category-helpers.js
// 05-book-index.js
// 06-filters.js
// 07-pagination.js
// 08-data-loader.js
// 09-tabs.js
// 10-dark-mode.js
// 11-clipboard.js
// 12-suggestions.js
// 13-url-params.js
// 14-bookmarks.js
// 15-category-checkboxes.js
// app.js

/* ============================================
   SEARCH INPUT (with debounce) - Override
   ============================================ */
// This is already overridden in suggestions.js
// The original onSearchInput is replaced there.

/* ============================================
   START
   ============================================ */
document.addEventListener('DOMContentLoaded', function() {
    setupTabs();
    loadData();
});

/* ============================================
   SERVICE WORKER REGISTRATION
   ============================================ */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('[SW] Registered successfully:', registration);
            })
            .catch(function(error) {
                console.log('[SW] Registration failed:', error);
            });
    });
}