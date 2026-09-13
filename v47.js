(()=>{
const $=id=>document.getElementById(id);
const style=document.createElement('style');
style.textContent=`.testamenttabs{grid-template-columns:repeat(3,1fr)!important}.study-list{display:grid;gap:2px}.study-choice{display:flex;align-items:center;gap:8px;border-bottom:1px solid var(--line);padding:3px 0}.study-choice:last-child{border-bottom:0}.study-choice>button:first-child{font:inherit;color:var(--text);background:transparent;border:0;text-align:left;flex:1;padding:9px 5px;border-radius:7px}.study-choice>button:first-child:active{background:#2b3531}.study-detail{padding:18px}.study-verse{display:block;width:100%;font:inherit;color:var(--text);background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:12px;text-align:left;margin:8px 0}.saved-section{margin:0 0 18px;padding:14px;border:1px solid var(--line);border-radius:14px;background:var(--panel)}.saved-title{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--gold);font-weight:800;margin-bottom:8px}.saved-empty{font-size:13px;color:var(--muted)}.saved-row{display:grid;grid-template-columns:auto 1fr auto;gap:8px;align-items:center;padding:7px 0;border-top:1px solid var(--line)}.saved-row:first-of-type{border-top:0}.saved-link{font:inherit;text-align:left;color:var(--text);background:transparent;border:0;padding:8px 0}.saved-delete{border:0;background:transparent;color:var(--muted);font-size:20px;padding:4px 7px}.save-study-btn{width:100%;font:inherit;color:var(--text);background:var(--panel2);border:1px solid var(--line);border-radius:9px;padding:9px 10px;margin-top:10px}.refreshicon.spinning svg{animation:vs-spin .7s linear infinite}@keyframes vs-spin{to{transform:rotate(360deg)}}`;
document.head.appendChild(style);
for(const el of document.querySelectorAll('div'))if(el.textContent?.includes('V4.6')&&el.children.length===0)el.textContent=el.textContent.replace('V4.6','V4.9');
const tabs=document.querySelector('.testamenttabs');
if(tabs&&!$('studiesTab')){const b=document.createElement('button');b.id='studiesTab';b.textContent='Studies';tabs.appendChild(b)}
const saved=$('savedPickerSection');
if(saved){saved.style.display='none';tabs?.insertAdjacentElement('afterend',saved)}
const picker=$('pickerOverlay');
if(picker&&!$('studyDetailScreen')){const d=document.createElement('div');d.id='studyDetailScreen';d.style.display='none';d.innerHTML='<div class="pickerhead"><button class="backbtn" id="closeStudyDetail">←</button><div class="pickertitle" id="studyDetailTitle">Study</div></div><div class="study-detail" id="studyDetailBody"></div>';picker.appendChild(d)}

const settingsButton=$('openSettings');
if(settingsButton&&!$('forceRefresh')){
 const b=document.createElement('button');
 b.id='forceRefresh';b.className='iconbtn refreshicon';b.setAttribute('aria-label','Refresh to newest version');b.title='Refresh to newest version';
 b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6v5h-5"/><path d="M19 11a7.5 7.5 0 1 0 .2 4"/></svg>';
 settingsButton.insertAdjacentElement('afterend',b);
 b.onclick=async()=>{
  b.classList.add('spinning');b.disabled=true;b.title='Updating…';
  try{
   if('serviceWorker' in navigator){
    const regs=await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map(r=>r.update().catch(()=>{})));
   }
   if('caches' in window){
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k.startsWith('verse-study-')).map(k=>caches.delete(k)));
   }
   await fetch(`./index.html?force=${Date.now()}`,{cache:'no-store'}).catch(()=>{});
  }finally{
   const u=new URL(location.href);u.searchParams.set('refresh',Date.now());location.replace(u.toString());
  }
 };
}

function closeAllVisual(){for(const id of ['pickerOverlay','settingsOverlay']){const el=$(id);if(el){el.classList.remove('show');el.setAttribute('aria-hidden','true')}}const share=$('shareOverlay');if(share){share.classList.remove('show');share.setAttribute('aria-hidden','true')}document.body.style.overflow='';if($('booksScreen'))$('booksScreen').style.display='block';if($('verseScreen'))$('verseScreen').style.display='none';if($('studyDetailScreen'))$('studyDetailScreen').style.display='none'}
function pushOverlay(state){if(history.state?.vs47!==state)history.pushState({vs47:state},'')}
function exitOverlay(){if(history.state?.vs47)history.back();else closeAllVisual()}
window.addEventListener('popstate',()=>closeAllVisual());
const oldOpenPicker=openPicker;
openPicker=function(){oldOpenPicker();pushOverlay('picker')};
$('openPicker').onclick=openPicker;
const oldOpenSettings=openSettings;
openSettings=function(){oldOpenSettings();pushOverlay('settings')};
$('openSettings').onclick=openSettings;
$('closeSettings').onclick=exitOverlay;
$('closePicker').onclick=exitOverlay;
const backVerse=$('backToBooks');if(backVerse)backVerse.onclick=exitOverlay;
const closeStudy=$('closeStudyDetail');if(closeStudy)closeStudy.onclick=exitOverlay;
function setMainTab(t){pickerTestament=t;$('otTab').classList.toggle('active',t==='OT');$('ntTab').classList.toggle('active',t==='NT');$('studiesTab').classList.toggle('active',t==='STUDIES');if($('chapterPanel'))$('chapterPanel').style.display='none';if($('studyDetailScreen'))$('studyDetailScreen').style.display='none';$('booksScreen').style.display='block';if(t==='STUDIES'){$('bookColumns').style.display='none';saved.style.display='block';renderSavedPicker()}else{saved.style.display='none';$('bookColumns').style.display='grid';renderBookColumns()}}
setTestament=function(t){setMainTab(t)};
$('otTab').onclick=()=>setMainTab('OT');$('ntTab').onclick=()=>setMainTab('NT');$('studiesTab').onclick=()=>setMainTab('STUDIES');
const oldRenderBooks=renderBooks;
renderBooks=function(){oldRenderBooks();saved.style.display='none';$('studiesTab').classList.remove('active')};
function showStudy(i){const st=loadStudies()[i];if(!st)return;$('booksScreen').style.display='none';$('verseScreen').style.display='none';$('studyDetailScreen').style.display='block';$('studyDetailTitle').textContent=st.name||'Study';const body=$('studyDetailBody');body.innerHTML=(st.verses||[]).map((v,j)=>`<button class="study-verse" data-v="${j}">${esc(refOf(v))}</button>`).join('')||'<div class="saved-empty">This study has no verses.</div>';body.querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>{const v=st.verses[Number(b.dataset.v)];if(v)goTo(v)})}
renderSavedPicker=function(){if(!saved)return;const bookmarks=loadBookmarks(),studies=loadStudies();let h='<div class="saved-section"><div class="saved-title">Saved Studies</div>';if(!studies.length)h+='<div class="saved-empty">Named studies will appear here.</div>';else h+='<div class="study-list">'+studies.map((st,i)=>`<div class="study-choice"><button data-open-study="${i}">${esc(st.name||'Untitled study')}</button><button class="saved-delete" data-delete-study="${i}" aria-label="Delete study">×</button></div>`).join('')+'</div>';h+='</div><div class="saved-section"><div class="saved-title">Current Bookmarks</div>';if(!bookmarks.length)h+='<div class="saved-empty">No bookmarks saved yet.</div>';else{h+=bookmarks.map((b,i)=>`<div class="saved-row"><input type="checkbox" class="study-select" data-index="${i}" aria-label="Select ${esc(refOf(b))} for a study"><button class="saved-link" data-bookmark="${i}">${esc(refOf(b))}</button><button class="saved-delete" data-delete-bookmark="${i}" aria-label="Delete bookmark">×</button></div>`).join('');h+='<button class="save-study-btn" id="saveSelectedStudy">Save selected bookmarks as a study</button>'}h+='</div>';saved.innerHTML=h;saved.querySelectorAll('[data-bookmark]').forEach(b=>b.onclick=()=>goTo(bookmarks[Number(b.dataset.bookmark)]));saved.querySelectorAll('[data-delete-bookmark]').forEach(b=>b.onclick=()=>{const a=loadBookmarks();a.splice(Number(b.dataset.deleteBookmark),1);saveBookmarks(a);renderSavedPicker();updateBookmarkUI()});saved.querySelectorAll('[data-open-study]').forEach(b=>b.onclick=()=>showStudy(Number(b.dataset.openStudy)));saved.querySelectorAll('[data-delete-study]').forEach(b=>b.onclick=()=>{const a=loadStudies();a.splice(Number(b.dataset.deleteStudy),1);saveStudies(a);renderSavedPicker()});const sb=$('saveSelectedStudy');if(sb)sb.onclick=()=>{const picked=[...saved.querySelectorAll('.study-select:checked')].map(c=>bookmarks[Number(c.dataset.index)]).filter(Boolean);if(!picked.length){alert('Select at least one bookmark first.');return}const name=(prompt('Name this study:')||'').trim();if(!name)return;const a=loadStudies();a.push({name,verses:picked.map(v=>({...v}))});saveStudies(a);renderSavedPicker()}}
let sx=0,sy=0,st=0,overlaySwipe=false;
document.addEventListener('touchstart',e=>{if(e.touches.length!==1)return;sx=e.touches[0].clientX;sy=e.touches[0].clientY;st=Date.now();overlaySwipe=!!e.target.closest('.overlay.show,.shareoverlay.show')},{passive:true});
document.addEventListener('touchend',e=>{if(!st||e.changedTouches.length!==1)return;const dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy,dt=Date.now()-st;st=0;if(dt>900||Math.abs(dx)<65||Math.abs(dx)<Math.abs(dy)*1.25)return;if(overlaySwipe){if(dx>0)exitOverlay();return}if(e.target.closest('input,select,textarea,.commentary-body'))return;if(dx<0)next();else previous()},{passive:true});
})();
