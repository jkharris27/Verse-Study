const CACHE='verse-study-v69';
const SHELL=['./index.html','./manifest.webmanifest','./icon.svg','./share-qr.svg'];
function injectEnhancements(html){
 if(!html.includes('v47.js'))html=html.replace('</body>','<script src="./v47.js?v=69"></script></body>');
 if(!html.includes('v411.js'))html=html.replace('</body>','<script src="./v411.js?v=69"></script></body>');
 if(!html.includes('tcw.js'))html=html.replace('</body>','<script src="./tcw.js?v=69"></script></body>');
 if(!html.includes('tcw-ui-fix.js'))html=html.replace('</body>','<script src="./tcw-ui-fix.js?v=69"></script></body>');
 if(!html.includes('ios-safe-area.js'))html=html.replace('</body>','<script src="./ios-safe-area.js?v=69"></script></body>');
 if(!html.includes('verse-cleanup.js'))html=html.replace('</body>','<script src="./verse-cleanup.js?v=69"></script></body>');
 if(!html.includes('info-sheets.js'))html=html.replace('</body>','<script src="./info-sheets.js?v=69"></script></body>');
 if(!html.includes('translation-notes.js'))html=html.replace('</body>','<script src="./translation-notes.js?v=69"></script></body>');
 if(!html.includes('current-version.js'))html=html.replace('</body>','<script src="./current-version.js?v=69"></script></body>');
 return html;
}
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)));await self.clients.claim()})()));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);if(url.origin!==self.location.origin)return;
 if(url.pathname.endsWith('/update.html')){event.respondWith(fetch(event.request,{cache:'no-store'}));return;}
 if(event.request.mode==='navigate'){
  event.respondWith(fetch(event.request,{cache:'no-store'}).then(async response=>{const html=injectEnhancements(await response.clone().text());const out=new Response(html,{status:response.status,statusText:response.statusText,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}});const copy=out.clone();caches.open(CACHE).then(cache=>cache.put('./index.html',copy));return out}).catch(async()=>{const cached=await caches.match('./index.html');if(!cached)return cached;const html=injectEnhancements(await cached.text());return new Response(html,{headers:{'Content-Type':'text/html; charset=utf-8'}})}));return;
 }
 if(['/v47.js','/v411.js','/tcw.js','/tcw-ui-fix.js','/ios-safe-area.js','/verse-cleanup.js','/info-sheets.js','/translation-notes.js','/current-version.js','/manifest.webmanifest'].some(p=>url.pathname.endsWith(p))){event.respondWith(fetch(event.request,{cache:'no-store'}).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response}).catch(()=>caches.match(event.request)));return;}
 event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response})));
});