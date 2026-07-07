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