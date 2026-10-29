/* 《肉墊的夢境編織》Service Worker：快取遊戲殼，讓遊戲可離線開啟。 */
'use strict';

const CACHE = 'cat-dream-weaver-v5';

// 遊戲殼（相對於本檔所在目錄）；個別檔案失敗不影響整體安裝
const SHELL = [
  './',
  './index.html',
  './styles.css',
  './cat-art.js',
  './audio.js',
  './cloud.js',
  './maze.js',
  './match3.js',
  './main.js',
  './supabase-config.js',
  '../../supabase-config.js',
  './manifest.json',
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
];

// 允許快取的跨域主機：僅 CDN 上的靜態函式庫
const CDN_HOSTS = ['cdn.jsdelivr.net'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      Promise.all(
        SHELL.map((url) =>
          cache.add(new Request(url, { cache: 'reload' })).catch(() => {})
        )
      )
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k.startsWith('cat-dream-weaver-') && k !== CACHE)
          .map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  // Supabase 與其他跨域 API 一律不經 SW，直接走網路
  if (!sameOrigin && !CDN_HOSTS.includes(url.hostname)) return;

  // 頁面導覽：網路優先，離線時回退快取
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          putCache(req, res.clone());
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match('./index.html')))
    );
    return;
  }

  // 其他資源：先回快取、背景更新（stale-while-revalidate）
  event.respondWith(
    caches.match(req).then((hit) => {
      const net = fetch(req)
        .then((res) => {
          putCache(req, res.clone());
          return res;
        })
        .catch(() => hit);
      return hit || net;
    })
  );
});

function putCache(req, res) {
  // 只快取成功的同源回應或 CORS 回應；不快取 opaque / 錯誤回應
  if (!res || !res.ok || (res.type !== 'basic' && res.type !== 'cors')) return;
  caches.open(CACHE).then((cache) => cache.put(req, res)).catch(() => {});
}
