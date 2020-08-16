try {
  console.log('Custom service-worker, try to load ngsw-worker...');
  importScripts('./ngsw-worker.js');
} catch (err) {
  console.log('Failed to load ngsw-worker, if this happened on production, please check');
}

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting()); // Activate worker immediately
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim()); // Become available to all pages
});