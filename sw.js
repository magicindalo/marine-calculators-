const CACHE='indalo-marine-calculators-v20';
const ASSETS=['./','./index.html','./manifest.webmanifest','./assets/indalo-marine-logo-colour.svg','./assets/indalo-app-icon.png','./assets/indalo-ocean-scene.svg','./exhaust.html','./exhaust-core.js','./exhaust.webmanifest','./cable.html','./cable-core.js','./cable.webmanifest','./engine.html','./engine-core.js','./engine.webmanifest','./load.html','./load.webmanifest','./battery.html','./battery.webmanifest','./battery-core.js','./thruster.html','./thruster-core.js','./thruster.webmanifest','./propeller.html','./propeller.webmanifest','./resistance.js','./reports.js'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 if(e.request.mode==='navigate'){
  e.respondWith(fetch(e.request).then(res=>{
   if(res.ok&&new URL(e.request.url).origin===self.location.origin){const clone=res.clone();caches.open(CACHE).then(c=>c.put(e.request,clone));}
   return res;
  }).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));
  return;
 }
 e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{
  if(res.ok&&new URL(e.request.url).origin===self.location.origin){const copy=res.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));}
  return res;
 }).catch(()=>Response.error())));
});