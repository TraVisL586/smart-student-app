const CACHE='smart-student-v35';
const CORE=['/','/index.html','/manifest.webmanifest','/assets/turtle-mascot.webp','/assets/turtle-mascot.png','/assets/smart-student-icon.png','/assets/reward-ueh-polo.png','/assets/reward-ueh-notebook.png','/assets/reward-ueh-keychain.png','/assets/reward-ueh-tote.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('/index.html'))));});
