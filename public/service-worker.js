// 1. OneSignal SDK (सबसे ऊपर)
importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');

// 2. Cache सेटिंग्स (वर्जन v4 कर दिया है ताकि v3 वाला पुराना कचरा साफ़ हो जाए)
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

  // [सुधार 1] API, Cart, और Orders के लिए 'Network Only' या 'Network First' बिना किसी देरी के
  if (url.pathname.includes('/api/') || url.pathname.includes('/cart/') || url.pathname.includes('/orders/')) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' }) // पक्का करता है कि ब्राउज़र कैश इस्तेमाल न करे
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // [सुधार 2] HTML फाइल्स के लिए 'Network First' ताकि बदलाव तुरंत दिखें
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

  // बाकी फाइल्स (Images, Icons) के लिए Cache-First
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// नोटिफिकेशन क्लिक हैंडलर
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const rootUrl = new URL('/', self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url === rootUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(rootUrl);
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
