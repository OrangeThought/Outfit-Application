const CACHE_NAME = "hello-app-v3";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./manifest.json"
];

self.addEventListener("install", event => {
    self.skipWaiting();

    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(FILES_TO_CACHE);
        })
    );
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", event => {
    event.respondWith(
        fetch(event.request)
            .then(response => {

                // On utilise la nouvelle version venant du serveur
                // et on la remet dans le cache.
                const responseClone = response.clone();

                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseClone);
                });

                return response;
            })
            .catch(() => {
                // Si Internet est indisponible,
                // on utilise la version locale.
                return caches.match(event.request);
            })
    );
});