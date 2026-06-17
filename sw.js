const SHELL_CACHE = "yp-clips-shell-v1";
const VIDEO_CACHE = "yp-clips-video-v1";
const SHELL = ["./", "./index.html", "./styles.css", "./app.js", "./clips.js", "./manifest.webmanifest"];

self.addEventListener("install", (event) => event.waitUntil(caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL))));
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || request.headers.has("range")) return;
  if (request.destination === "video") {
    event.respondWith(caches.open(VIDEO_CACHE).then(async (cache) => {
      const cached = await cache.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok && response.type !== "opaque") cache.put(request, response.clone());
      return response;
    }));
    return;
  }
  event.respondWith(caches.match(request).then((cached) => cached || fetch(request)));
});
