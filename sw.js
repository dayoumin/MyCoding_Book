const CACHE_NAME = 'mycoding-book-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/orchestration.html',
  '/mcp-guide.html',
  '/assets/css/style.css',
  '/assets/js/config.js',
  '/assets/js/main.js',
  '/assets/js/search.js',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png'
];

// 설치 이벤트
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('캐시 열기 성공');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('캐시 추가 실패:', error);
      })
  );
  self.skipWaiting();
});

// 활성화 이벤트
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('이전 캐시 삭제:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 네트워크 우선, 캐시 대체 전략
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 유효한 응답인 경우 캐시에 저장
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
        }
        return response;
      })
      .catch(() => {
        // 네트워크 실패 시 캐시에서 반환
        return caches.match(event.request)
          .then((response) => {
            if (response) {
              return response;
            }
            // 캐시에도 없으면 오프라인 페이지 반환 (선택사항)
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
          });
      })
  );
});

// 백그라운드 동기화 (선택사항)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  // 백그라운드 동기화 로직
  console.log('백그라운드 동기화 시작');
}

// 푸시 알림 (선택사항)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'MyCoding Book 업데이트',
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('MyCoding Book', options)
  );
});

// 알림 클릭
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
