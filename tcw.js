(()=>{
const TCW_CODE='TCW';
const TCW_EXPECTED=31102;
let tcwVerses=null;
let tcwReady=false;
const $=id=>document.getElementById(id);
const PREFIXES=['gen','ex','lev','num','deut','josh','judg','ruth','sam1','sam2','kin1','kin2','chr1','chr2','ezra','neh','esth','job','ps','prov','eccl','song','is','jer','lam','ezek','dan','hos','joel','amos','obad','jon','mic','nah','hab','zeph','hag','zec','mal','matt','mark','luke','john','acts','rom','cor1','cor2','gal','eph','phil','col','thess1','thess2','tim1','tim2','titus','phile','heb','james','pet1','pet2','john1','john2','john3','jude','rev'];
const BOOK_NUM=Object.fromEntries(PREFIXES.map((p,i)=>[p,i+1]));
function ensureOption(){
 if(typeof VERSION_OPTIONS==='undefined')return;
 const list=VERSION_OPTIONS.paraphrase;
 const i=list.findIndex(v=>v.code===TCW_CODE);
 if(tcwReady&&i<0)list.push({code:TCW_CODE,name:'The Clear Word (your EPUB)'});
 if(!tcwReady&&i>=0)list.splice(i,1);
}
function loadJSZip(){
 if(window.JSZip)return Promise.resolve(window.JSZip);
 return new Promise((resolve,reject)=>{
  const s=document.createElement('script');
  s.src='https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';
  s.onload=()=>resolve(window.JSZip);
  s.onerror=()=>reject(new Error('Could not load the EPUB reader. Check your internet connection and try again.'));
  document.head.appendChild(s);
 });
}
function cleanVerseText(text){
 return String(text||'').replace(/\u00a0/g,' ').replace(/\s+/g,' ').replace(/^\s*\d+[a-z]?\s*/i,'').trim();
}
function extractFromHtml(html,verses){
 if(!/(?:id|name)=["'][a-z0-9]+\.\d+\.\d+["']/i.test(html))return 0;
 const doc=new DOMParser().parseFromString(html,'text/html');
 const anchors=[...doc.querySelectorAll('a[id],a[name]')].filter(a=>/^([a-z0-9]+)\.(\d+)\.(\d+)$/i.test(a.id||a.getAttribute('name')||''));
 let added=0;
 for(let i=0;i<anchors.length;i++){
  const a=anchors[i];
  const id=a.id||a.getAttribute('name')||'';
  const m=id.match(/^([a-z0-9]+)\.(\d+)\.(\d+)$/i);
  if(!m)continue;
  const book=BOOK_NUM[m[1].toLowerCase()];
  if(!book)continue;
  const range=doc.createRange();
  range.setStartAfter(a);
  if(i+1<anchors.length)range.setEndBefore(anchors[i+1]);
  else {
   const container=a.closest('p,div,li,blockquote')||doc.body;
   try{range.setEnd(container,container.childNodes.length)}catch{range.setEndAfter(a)}
  }
  const text=cleanVerseText(range.toString());
  if(!text)continue;
  const key=`${book}.${Number(m[2])}.${Number(m[3])}`;
  verses[key]=text;
  added++;
 }
 return added;
}
async function openEpub(file){
 if(!file||!file.name?.toLowerCase().endsWith('.epub'))throw new Error('Choose your Clear Word .epub file.');
 const JSZip=await loadJSZip();
 const zip=await JSZip.loadAsync(await file.arrayBuffer());
 const htmlFiles=Object.values(zip.files).filter(f=>!f.dir&&/\.(?:xhtml|html|htm)$/i.test(f.name));
 const verses={};
 for(let i=0;i<htmlFiles.length;i++){
  const html=await htmlFiles[i].async('string');
  extractFromHtml(html,verses);
 }
 const count=Object.keys(verses).length;
 if(count!==TCW_EXPECTED)throw new Error(`This EPUB did not read as the expected Clear Word Bible (${count.toLocaleString()} of ${TCW_EXPECTED.toLocaleString()} verses found).`);
 tcwVerses=verses;
 tcwReady=true;
 ensureOption();
 try{syncSettingsUI()}catch{}
 if(typeof settings!=='undefined'){
  settings.paraphrase=TCW_CODE;
  try{saveSettings()}catch{}
 }
 updateUI(file.name,count);
 try{syncSettingsUI()}catch{}
 try{render()}catch{}
 alert('The Clear Word is ready for this session. Verse Study did not save a copy of the book.');
}
function addUI(){
 const settingsBody=document.querySelector('.settingsbody');
 if(!settingsBody||$('tcwPrivateSection'))return;
 const section=document.createElement('section');
 section.id='tcwPrivateSection';
 section.className='settings-section';
 section.innerHTML=`<h2>The Clear Word</h2><div class="settingsnote">Use your own local Clear Word EPUB. Verse Study reads it only for the current session and does not upload or save the book.</div><div id="tcwPrivateStatus" class="settingsnote" style="margin-top:10px">No EPUB open.</div><input id="tcwEpubInput" type="file" accept=".epub,application/epub+zip" style="display:none"><button id="tcwOpenBtn" class="resetbtn" type="button">Open my Clear Word EPUB</button><button id="tcwCloseBtn" class="resetbtn" type="button" style="display:none;margin-top:8px">Close Clear Word</button>`;
 const about=[...settingsBody.querySelectorAll('.settings-section')].find(s=>s.querySelector('h2')?.textContent.trim()==='About Verse Study');
 if(about)settingsBody.insertBefore(section,about);else settingsBody.appendChild(section);
 $('tcwOpenBtn').onclick=()=>$('tcwEpubInput').click();
 $('tcwEpubInput').onchange=async e=>{
  const f=e.target.files?.[0];if(!f)return;
  const b=$('tcwOpenBtn');b.disabled=true;b.textContent='Opening EPUB…';
  try{await openEpub(f)}catch(err){alert(`Could not open The Clear Word: ${err.message||err}`)}finally{b.disabled=false;b.textContent=tcwReady?'Open a different Clear Word EPUB':'Open my Clear Word EPUB';e.target.value=''}
 };
 $('tcwCloseBtn').onclick=()=>{
  tcwVerses=null;tcwReady=false;
  if(typeof settings!=='undefined'&&settings.paraphrase===TCW_CODE){settings.paraphrase='MSG';try{saveSettings()}catch{}}
  ensureOption();
  try{syncSettingsUI()}catch{}
  updateUI();
  try{render()}catch{}
 };
 updateUI();
}
function updateUI(name,count){
 const s=$('tcwPrivateStatus'),b=$('tcwOpenBtn'),c=$('tcwCloseBtn');if(!s)return;
 if(tcwReady){s.textContent=`Open for this session${name?`: ${name}`:''}${count?` (${count.toLocaleString()} verses)`:''}. Nothing from the book was saved by Verse Study.`;if(b)b.textContent='Open a different Clear Word EPUB';if(c)c.style.display='block'}
 else{s.textContent='No EPUB open. TCW will not appear as a paraphrase choice until you open your file.';if(b)b.textContent='Open my Clear Word EPUB';if(c)c.style.display='none'}
}
if(typeof publicVerse==='function'){
 const basePublicVerse=publicVerse;
 publicVerse=async function(type,x){
  if(type!==TCW_CODE)return basePublicVerse(type,x);
  if(!tcwReady||!tcwVerses)throw new Error('Open your Clear Word EPUB in Settings first.');
  const text=tcwVerses[`${x.book}.${x.chapter}.${x.verse}`];
  if(!text)throw new Error('Clear Word verse not found in the open EPUB.');
  return {text};
 };
}
function setVersion(){for(const el of document.querySelectorAll('div')){if(el.children.length===0&&/V4\.1[12]/.test(el.textContent||''))el.textContent=el.textContent.replace(/V4\.1[12]/,'V4.13')}}
function resetStaleTcwSetting(){
 try{
  if(typeof settings!=='undefined'&&settings.paraphrase===TCW_CODE){settings.paraphrase='MSG';saveSettings()}
 }catch{}
}
resetStaleTcwSetting();
ensureOption();
addUI();
setVersion();
})();
