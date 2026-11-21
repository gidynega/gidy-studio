/* =====================================================================
   GIDY STUDIO — SERVICE WORKER (V13)
   Pre-caches app shell + CSS/JS/icons + network-first with cache fallback
   ===================================================================== */

const CACHE_NAME = "gidy-studio-v13-shell";

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./gidy-photo.jpg",
  "./css/style.css",
  "./css/home.css",
  "./css/premium.css",
  "./js/app.js",
  "./js/pwa.js",
  "./js/editor-tabs.js",
  "./js/navigation.js",
  "./js/home.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll(
        APP_SHELL.map(url => new Request(url, { cache: "reload" }))
      )
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const req = event.request;

  if (
    req.method !== "GET" ||
    new URL(req.url).origin !== self.location.origin
  ) {
    return;
  }

  event.respondWith(
    fetch(req)
      .then(response => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(req, { ignoreSearch: true });
        if (cached) return cached;

        if (req.mode === "navigate") {
          const fallbackIndex = await caches.match("./index.html");
          if (fallbackIndex) return fallbackIndex;
        }

        return new Response("Offline: this resource is not cached yet.", {
          status: 503,
          headers: { "Content-Type": "text/plain; charset=utf-8" }
        });
      })
  );
});
