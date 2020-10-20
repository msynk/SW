var VERSION = '0.43',
    assets = [
        'index.html',
        'style.css',
        'script.js'
    ];

postMessage({ type: 'start', data: VERSION });




self.addEventListener('install', install);
self.addEventListener('activate', activate);
self.addEventListener('message', messageRecieved);

function install(e) {
    postMessage({ type: 'installing', data: VERSION });
    e.waitUntil(cacheAssets().then(function (e) {
        postMessage({ type: 'installed', data: VERSION });
    }));
}

function activate(e) {
    postMessage({ type: 'activate', data: VERSION });
}

function messageRecieved(e) {
    if (e.data == 'skipwaiting') {
        self.skipWaiting();
    }
}

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
                }, 1000 * (idx + 1));
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