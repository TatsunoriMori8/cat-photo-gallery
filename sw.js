// Service Worker for PWA
const CACHE_NAME = 'photo-gallery-v5'; // バージョン更新！
const urlsToCache = [
  '.',
  'index.html',
  'style.css',
  'app.js',
  'manifest.json',
  'icon-192.png',
  'icon-512.png',
  'data/images.json'
];

// インストール
self.addEventListener('install', event => {
  // 新しいService Workerをすぐにアクティブに
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('✅ Cache opened:', CACHE_NAME);
        return cache.addAll(urlsToCache);
      })
  );
});

// フェッチ - ネットワーク優先戦略に変更
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // ネットワークから取得成功したらキャッシュ更新
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // ネットワーク失敗時のみキャッシュを使用
        return caches.match(event.request);
      })
  );
});

// アクティベート（古いキャッシュを削除）
self.addEventListener('activate', event => {
  // すべてのクライアントを即座に制御
  event.waitUntil(
    clients.claim().then(() => {
      return caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      });
    })
  );
});
