const CACHE='marine-calculators-v8';
const ASSETS=['./','./index.html','./manifest.webmanifest','./load.html','./load.webmanifest','./battery.html','./battery.webmanifest','./battery-core.js','./propeller.html','./propeller.webmanifest','./resistance.js','./reports.js','./icon.svg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{
    if(res.ok&&new URL(e.request.url).origin===self.location.origin){const copy=res.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));}
    return res;
  }).catch(()=>e.request.mode==='navigate'?caches.match('./index.html'):Response.error())));
});