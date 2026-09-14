const CACHE='verse-study-v70';
const ASSET='70';
const SHELL=['./index.html','./manifest.webmanifest','./icon.svg','./share-qr.svg'];
function injectEnhancements(html){
 const add=src=>{if(!html.includes(src))html=html.replace('</body>',`<script src="./${src}?v=${ASSET}"></script></body>`)};
 ['v47.js','v411.js','tcw.js','tcw-ui-fix.js','ios-safe-area.js','verse-cleanup.js','info-sheets.js','translation-notes.js','current-version.js'].forEach(add);
 return html;
}
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(key=>key.startsWith('verse-study-')&&key!==CACHE).map(key=>caches.delete(key)));await self.clients.claim()})()));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);if(url.origin!==self.location.origin)return;
 if(url.pathname.endsWith('/update.html')||url.pathname.endsWith('/sw.js')){event.respondWith(fetch(event.request,{cache:'no-store'}));return;}
 if(event.request.mode==='navigate'){
  event.respondWith(fetch(event.request,{cache:'no-store'}).then(async response=>{const html=injectEnhancements(await response.clone().text());const out=new Response(html,{status:response.status,statusText:response.statusText,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}});caches.open(CACHE).then(cache=>cache.put('./index.html',out.clone()));return out}).catch(async()=>{const cached=await caches.match('./index.html');if(!cached)return new Response('Verse Study is temporarily unavailable.',{status:503,headers:{'Content-Type':'text/plain'}});const html=injectEnhancements(await cached.text());return new Response(html,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}})}));return;
 }
 if(['/v47.js','/v411.js','/tcw.js','/tcw-ui-fix.js','/ios-safe-area.js','/verse-cleanup.js','/info-sheets.js','/translation-notes.js','/current-version.js','/manifest.webmanifest'].some(p=>url.pathname.endsWith(p))){
  event.respondWith(fetch(event.request,{cache:'no-store'}).then(response=>{caches.open(CACHE).then(cache=>cache.put(event.request,response.clone()));return response}).catch(()=>caches.match(event.request)));return;
 }
 event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{caches.open(CACHE).then(cache=>cache.put(event.request,response.clone()));return response})));
});