const CACHE_NAME = "dev-maktuporia-portfolio-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/style.css",
  "/script.js",
  "/manifest.webmanifest",
  "/robots.txt",
  "/sitemap.xml",
  "/assets/icon.svg",
  "/assets/og-image.svg",
  "/assets/dev-maktuporia-resume.txt"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      const responseClone = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
      return response;
    }).catch(() => caches.match("/index.html")))
  );
});
