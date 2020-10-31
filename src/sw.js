var VERSION = '0.57',
    assets = [
        '/',
        '/style.css',
        '/script.js'
    ];

postMessage({ type: 'start', data: VERSION });

self.addEventListener('install', handleInstall);
self.addEventListener('activate', handleActivate);
self.addEventListener('message', handleMessage);
//self.addEventListener('fetch', handleFetch);

function handleInstall(e) {
    postMessage({ type: 'installing', data: VERSION });
    e.waitUntil(cacheAssets().then(function (e) {
        postMessage({ type: 'installed', data: VERSION });
    }));
}

function handleActivate(e) {
    postMessage({ type: 'activate', data: VERSION });
}

function handleMessage(e) {
    if (e.data == 'skipwaiting') {
        self.skipWaiting();
    }
    if (e.data && e.data.type === 'INIT_PORT') {
        var messagePort = e.ports[0];
        messagePort.onmessage = function (e) {
            console.log('SW messagePort:', e);
        }
        messagePort.postMessage('hello world from SW')
    }
}

function handleFetch(e) {
    console.log('fetch: ', e);
    var response = caches.match(e.request).then(function (response) {
        return response || self.fetch(e.request);
    });
    e.respondWith(response);
}

// ==================================================================

function cacheAssets() {
    return caches.open('chache-sw').then(function (c) {
        var total = assets.length, current = 0;
        var promisses = assets.map(function (a, idx) {
            return new Promise(function (resolve) {
                setTimeout(function () {
                    c.add(a).then(function () {
                        var percent = Math.floor((++current) / total * 100);
                        postMessage({ type: 'progress', data: [a, percent] });
                        resolve();
                    });
                }, 1.000 * (idx + 1));
            });
        });
        return Promise.all(promisses);
    });
}

function postMessage(message) {
    self.clients.matchAll({ includeUncontrolled: true, type: 'window', }).then(function (clients) {
        (clients || []).forEach(function (cl) { cl.postMessage(message); });
    });
}