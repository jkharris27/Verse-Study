const CACHE='verse-study-v50';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon.svg','./share-qr.svg'];
function injectEnhancements(html){
 if(html.includes('v47.js'))return html;
 return html.replace('</body>','<script src="./v47.js?v=50"></script></body>');
}
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);
 if(url.origin!==self.location.origin)return;
 if(event.request.mode==='navigate'){
  event.respondWith(fetch(event.request,{cache:'no-store'}).then(async response=>{
   const html=injectEnhancements(await response.clone().text());
   const out=new Response(html,{status:response.status,statusText:response.statusText,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}});
   const copy=out.clone();caches.open(CACHE).then(cache=>cache.put('./index.html',copy));return out;
  }).catch(async()=>{
   const cached=await caches.match('./index.html');
   if(!cached)return cached;
   const html=injectEnhancements(await cached.text());
   return new Response(html,{headers:{'Content-Type':'text/html; charset=utf-8'}});
  }));
  return;
 }
 if(url.pathname.endsWith('/v47.js')||url.pathname.endsWith('/manifest.webmanifest')){
  event.respondWith(fetch(event.request,{cache:'no-store'}).then(response=>{
   const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response;
  }).catch(()=>caches.match(event.request)));
  return;
 }
 event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response;})));
});
