const CACHE='verse-study-v72';
const SHELL=['./manifest.webmanifest','./icon.svg','./share-qr.svg'];
const ASSET_VER='72';
function injectEnhancements(html){
 const scripts=['v47.js','v411.js','tcw.js','tcw-ui-fix.js','ios-safe-area.js','verse-cleanup.js','info-sheets.js','translation-notes.js','current-version.js'];
 for(const src of scripts)if(!html.includes(src))html=html.replace('</body>',`<script src="./${src}?v=${ASSET_VER}"></script></body>`);
 return html;
}
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 const keys=await caches.keys();await Promise.all(keys.filter(key=>key.startsWith('verse-study-')&&key!==CACHE).map(key=>caches.delete(key)));
 await self.clients.claim();
 const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});
 for(const client of clients){try{const u=new URL(client.url);if(u.origin===self.location.origin&&u.pathname.includes('/Verse-Study/')&&u.searchParams.get('vsup')!==ASSET_VER){u.searchParams.set('vsup',ASSET_VER);u.searchParams.set('t',Date.now());client.navigate(u.href)}}catch{}}
})()));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);if(url.origin!==self.location.origin)return;
 if(url.pathname.endsWith('/update.html')||url.pathname.endsWith('/sw.js')){event.respondWith(fetch(event.request,{cache:'no-store'}));return;}
 if(event.request.mode==='navigate'){
  event.respondWith(fetch(event.request,{cache:'no-store'}).then(async response=>{const html=injectEnhancements(await response.clone().text());const out=new Response(html,{status:response.status,statusText:response.statusText,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store, no-cache, must-revalidate'}});caches.open(CACHE).then(cache=>cache.put('./index.injected.html',out.clone()));return out}).catch(async()=>{const cached=await caches.match('./index.injected.html');if(cached)return cached;return new Response('Verse Study needs an internet connection for this update.',{status:503,headers:{'Content-Type':'text/plain'}})}));return;
 }
 if(['/v47.js','/v411.js','/tcw.js','/tcw-ui-fix.js','/ios-safe-area.js','/verse-cleanup.js','/info-sheets.js','/translation-notes.js','/current-version.js','/manifest.webmanifest'].some(p=>url.pathname.endsWith(p))){event.respondWith(fetch(event.request,{cache:'no-store'}).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response}).catch(()=>caches.match(event.request)));return;}
 event.respondWith(fetch(event.request,{cache:'no-store'}).catch(()=>caches.match(event.request)));
});