const CACHE = "lasana-v6";
const PRECACHE = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/favicon-32.png",
  "/favicon-64.png",
  "/apple-touch-icon.png",
  "/icon-192.png",
  "/icon-512.png",
  "/assets/ui/icon_duelo_lasanas.png",
  "/assets/ui/logo_lasana_game.png",
  "/assets/ui/logo_lasana_game_compact.png",
  "/assets/ui/logo_lasana_game_light.png",
  "/assets/ui/logo_duelo_lasanas_splash.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

/** Cache-first para estáticos; la red manda para navegación y WebSockets. */
self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match("/index.html")));
    return;
  }
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ??
        fetch(request).then((response) => {
          const copy = response.clone();
          void caches.open(CACHE).then((cache) => cache.put(request, copy));
          return response;
        }),
    ),
  );
});
