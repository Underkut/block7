// 예전 주소의 서비스워커를 스스로 치운다 (앱은 block7.my/wallet/ 으로 옮겼다).
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => { e.waitUntil(self.registration.unregister().then(() => caches.keys()).then(ks => Promise.all(ks.filter(k => k.indexOf('allowance')===0).map(k => caches.delete(k))))); });
