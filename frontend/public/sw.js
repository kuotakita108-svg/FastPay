const CACHE='kuotakita-v4-fast-assets';
const CORE=['/','/login','/manifest.webmanifest?v=3','/icons/icon-192.png?v=3','/icons/icon-512.png?v=3','/icons/apple-touch-icon.png?v=3','/icons/favicon-32.png?v=3'];
const STATIC_FILE=/\.(?:js|css|png|jpe?g|webp|svg|ico|woff2?)$/i;

self.addEventListener('install',event=>event.waitUntil(
  caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting())
));
self.addEventListener('activate',event=>event.waitUntil(
  caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())
));
self.addEventListener('fetch',event=>{
  const request=event.request;
  const url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==self.location.origin||url.pathname.startsWith('/api/'))return;

  if(STATIC_FILE.test(url.pathname)||url.pathname.startsWith('/assets/')||url.pathname.startsWith('/icons/')){
    event.respondWith(caches.match(request).then(cached=>{
      const update=fetch(request).then(response=>{
        if(response.ok)caches.open(CACHE).then(cache=>cache.put(request,response.clone()));
        return response;
      }).catch(()=>cached);
      return cached||update;
    }));
    return;
  }

  if(request.mode==='navigate')event.respondWith(
    fetch(request).then(response=>{
      if(response.ok)caches.open(CACHE).then(cache=>cache.put(request,response.clone()));
      return response;
    }).catch(()=>caches.match(request).then(cached=>cached||caches.match('/')))
  );
});
