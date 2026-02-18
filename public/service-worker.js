// 1. OneSignal SDK (सबसे ऊपर)
importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');

// 2. Cache सेटिंग्स (वर्जन v4)
const CACHE_NAME = 'ratu-fresh-v4'; 
const ASSETS_TO_CACHE = [
  '/',
  '/main.html',
  '/profiles.html',
  '/manifest.json',
  '/icons/icon-192.png'
];

// इंस्टॉल इवेंट
self.addEventListener('install', (event) => {
  self.skipWaiting(); 
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

// --- महत्वपूर्ण सुधार: फेच इवेंट (RELIABLE LIVE DATA LOGIC) ---
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (url.pathname.includes('/api/') || url.pathname.includes('/cart/') || url.pathname.includes('/orders/')) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' }) 
        .catch(() => caches.match(event.request))
    );
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// --- [EXTRA POWER] पुश नोटिफिकेशन लिसनर (बैकग्राउंड में जगाने के लिए) ---
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body || "Fresh vegetables are waiting!",
            icon: '/icons/icon-192.png',
            badge: '/icons/icon-192.png',
            vibrate: [200, 100, 200],
            data: { url: data.url || '/' }
        };
        event.waitUntil(
            self.registration.showNotification(data.title || "Ratu Fresh", options)
        );
    }
});

// नोटिफिकेशन क्लिक हैंडलर
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data.url || '/';
  const fullUrl = new URL(targetUrl, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url === fullUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(fullUrl);
      }
    })
  );
});

// 3. पुराने Cache को साफ़ करना (Activate Event)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('Old cache deleted:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});
