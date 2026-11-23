/* =====================================
   GIDY STUDIO - SERVICE WORKER
   V12 - Improved offline support
===================================== */

const CACHE_NAME = "gidy-studio-v12-cache-1";

const APP_FILES = [
  "./",
  "./index.html",
  "./manifest.webmanifest",

  // CSS files
  "./css/style.css",
  "./css/home.css",
  "./css/premium.css",

  // JavaScript files
  "./js/app.js",
  "./js/pwa.js",
  "./js/editor-tabs.js",
  "./js/navigation.js",
  "./js/home.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter(
          (key) => key.startsWith("gidy-studio-") &&
                   key !== CACHE_NAME
        ).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const requestURL = new URL(event.request.url);

  if (requestURL.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.ok) {
          const copy = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => cache.put(event.request, copy));
        }

        return response;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);

        if (cached) return cached;

        if (event.request.mode === "navigate") {
          const home = await caches.match("./index.html");

          if (home) return home;
        }

        return new Response(
          "Offline: this resource is not available yet.",
          {
            status: 503,
            headers: {
              "Content-Type": "text/plain; charset=utf-8"
            }
          }
        );
      })
  );
});