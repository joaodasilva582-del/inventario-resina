const CACHE_NAME = 'spiltag-resinas-v2';

const assets = [
    './',
    './index.html',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];

// Instala o Service Worker e salva os arquivos principais no cache
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(assets))
            .then(() => self.skipWaiting())
    );
});

// Ativa o novo Service Worker e remove caches antigos
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => {
                return Promise.all(
                    keys.map(key => {
                        if (key !== CACHE_NAME) {
                            return caches.delete(key);
                        }
                    })
                );
            })
            .then(() => self.clients.claim())
    );
});

// Mantém o app funcionando online e offline
self.addEventListener('fetch', event => {

    // Só intercepta requisições GET
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {

                // Se já estiver no cache, usa o arquivo salvo
                if (cachedResponse) {
                    return cachedResponse;
                }

                // Caso contrário, busca na internet
                return fetch(event.request)
                    .then(networkResponse => {

                        // Não salva respostas inválidas
                        if (
                            !networkResponse ||
                            networkResponse.status !== 200 ||
                            networkResponse.type !== 'basic'
                        ) {
                            return networkResponse;
                        }

                        const responseClone = networkResponse.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseClone);
                            });

                        return networkResponse;
                    });

            })
    );
});
