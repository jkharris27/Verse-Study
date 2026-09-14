(()=>{
// CSB support. The app presents the friendly code CSB while Bolls uses CSB17.
if(typeof VERSION_OPTIONS==='undefined'||typeof publicVerse!=='function')return;

if(!VERSION_OPTIONS.loose.some(v=>v.code==='CSB')){
 const nivIndex=VERSION_OPTIONS.loose.findIndex(v=>v.code==='NIV2011');
 const at=nivIndex>=0?nivIndex+1:VERSION_OPTIONS.loose.length;
 VERSION_OPTIONS.loose.splice(at,0,{code:'CSB',name:'Christian Standard Bible'});
}

if(!publicVerse.__vsCsbWrapped){
 const basePublicVerse=publicVerse;
 const wrapped=async function(type,x){return basePublicVerse(type==='CSB'?'CSB17':type,x)};
 wrapped.__vsCsbWrapped=true;
 publicVerse=wrapped;
}

const aboutHeading=[...document.querySelectorAll('.settings-section h2')].find(h=>h.textContent.trim()==='About Verse Study');
const aboutSection=aboutHeading?.closest('.settings-section');
if(aboutSection&&!document.getElementById('csbCopyright')){
 const credit=document.createElement('div');credit.id='csbCopyright';credit.className='settingsnote';credit.style.marginTop='10px';
 credit.textContent='Scripture quotations marked CSB have been taken from the Christian Standard Bible®, Copyright © 2017 by Holman Bible Publishers. Used by permission. Christian Standard Bible® and CSB® are federally registered trademarks of Holman Bible Publishers.';
 aboutSection.appendChild(credit);
}
try{const stored=JSON.parse(SAFE_STORAGE.getItem('verseStudy.settings')||'{}');if(stored.loose==='CSB'&&settings.loose!=='CSB'){settings={...settings,loose:'CSB'};syncSettingsUI();render()}}catch{}

function loadLatest(src){return new Promise(resolve=>{if([...document.scripts].some(s=>(s.src||'').includes('/'+src))){resolve();return}const s=document.createElement('script');s.src=`./${src}?heal=${Date.now()}`;s.onload=resolve;s.onerror=resolve;document.body.appendChild(s)})}
(async()=>{
 for(const src of ['tcw.js','tcw-ui-fix.js','ios-safe-area.js','verse-cleanup.js','info-sheets.js','translation-notes.js','current-version.js']) await loadLatest(src);
 if(!window.VERSE_STUDY_VERSION){for(const el of document.querySelectorAll('div'))if(el.children.length===0&&/V4\.(?:6|7|8|9|10|11)/.test(el.textContent||''))el.textContent=el.textContent.replace(/V4\.(?:6|7|8|9|10|11)/g,'V4.20')}
})();
})();
