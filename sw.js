const CACHE = 'nurlan-pwa-v3-vector-arrows-1';
const PREFIX = 'nurlan-';
const CORE = ["./assets/taularym.webp","./assets/event-2026-05-28-nalchik.webp","./assets/event-2026-07-15-cherkessk.webp","./assets/event-2026-10-02-kendelen.webp","./", "./index.html", "./styles.css", "./styles.css?v=hero-light1", "./script.js", "./script.js?v=taularym1", "./manifest.webmanifest", "./vendor/gsap.min.js", "./vendor/ScrollTrigger.min.js", "./assets/analany-suyuguz.webp", "./assets/ariu-kyzym.webp", "./assets/ariusa-sen.webp", "./assets/chigyp-chigyp.webp", "./assets/event-2026-08-28-tyrnyauz.webp", "./assets/event-2026-09-05-kashkhatau.webp", "./assets/favicon.ico", "./assets/favicon.png", "./assets/fonts/cormorant-500.ttf", "./assets/fonts/manrope-400.ttf", "./assets/hur-melegim.webp", "./assets/icon-192.png", "./assets/icon-512.png", "./assets/ilyachin.webp", "./assets/portrait-dark.webp", "./assets/portrait-hero.webp", "./assets/portrait-light.webp", "./assets/salam-karachay.webp", "./assets/si-nane-dahe.webp", "./assets/sobardihya-sihmalo.webp", "./assets/taulu-halkym.webp"];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)));});
// A new release waits until old tabs close, so one page never mixes two releases.
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith(PREFIX)&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
  const req=event.request,url=new URL(req.url);
  if(req.method!=='GET'||url.origin!==self.location.origin||!url.href.startsWith(self.registration.scope))return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    const cached=await cache.match(req);
    if(cached)return cached;
    try{
      const response=await fetch(req);
      if(response.ok&&['image','font','script','style'].includes(req.destination))await cache.put(req,response.clone());
      return response;
    }catch(error){
      if(req.mode==='navigate')return (await cache.match('./index.html'))||Response.error();
      return Response.error();
    }
  })());
});
