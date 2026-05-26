const CACHE_NAME = "mycoding-book-v2";
const urlsToCache = [
  "/",
  "/index.html",
  "/codex.html",
  "/updates.html",
  "/codex/index.html",
  "/codex/agent-workflow.html",
  "/codex/roadmap.html",
  "/codex/agentic-stack.html",
  "/codex/versioning-policy.html",
  "/codex/skills.html",
  "/codex/mcp-connectors.html",
  "/codex/browser-computer-use.html",
  "/updates/index.html",
  "/updates/2026-05-codex.html",
  "/reference/index.html",
  "/legacy/index.html",
  "/orchestration.html",
  "/mcp-guide.html",
  "/assets/css/style.css",
  "/assets/js/config.js",
  "/assets/js/main.js",
  "/assets/js/search.js",
  "/assets/icons/icon-192x192.png",
  "/assets/icons/icon-512x512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(error => {
        console.log("Cache add failed:", error);
      })
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => Promise.all(
      cacheNames.map(cacheName => {
        if (cacheName !== CACHE_NAME) {
          return caches.delete(cacheName);
        }
        return undefined;
      })
    ))
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => caches.match(event.request).then(response => {
        if (response) {
          return response;
        }
        if (event.request.mode === "navigate") {
          return caches.match("/index.html");
        }
        return undefined;
      }))
  );
});
