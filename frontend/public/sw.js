const CACHE='kuotakita-v7-shell';
const CORE=['/manifest.webmanifest?v=3','/icons/icon-192.png?v=3','/icons/icon-512.png?v=3','/icons/apple-touch-icon.png?v=3','/icons/favicon-32.png?v=3'];
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

  // Aset Vite sudah memiliki hash dan Cache-Control immutable dari nginx.
  // Jangan simpan chunk JS/CSS di service worker karena satu chunk lama dapat
  // mengimpor chunk lain yang sudah tidak ada setelah deployment berikutnya.
  if(url.pathname.startsWith('/assets/'))return;

  if(STATIC_FILE.test(url.pathname)||url.pathname.startsWith('/icons/')){
    event.respondWith(caches.match(request).then(cached=>{
      const update=fetch(request).then(response=>{
        // Clone harus dibuat sebelum response dikembalikan ke browser. Jika clone
        // menunggu caches.open(), body bisa telanjur dipakai oleh halaman.
        if(response.ok){
          const copy=response.clone();
          caches.open(CACHE).then(cache=>cache.put(request,copy)).catch(()=>{});
        }
        return response;
      }).catch(()=>cached);
      return cached||update;
    }));
    return;
  }

  if(request.mode==='navigate')event.respondWith(
    fetch(request).then(response=>{
      if(response.ok){
        const copy=response.clone();
        caches.open(CACHE).then(cache=>cache.put(request,copy)).catch(()=>{});
      }
      return response;
    }).catch(()=>caches.match(request).then(cached=>cached||caches.match('/')))
  );
});
