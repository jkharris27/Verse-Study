(()=>{
const TCW='TCW';
function ensureTcwOption(){
 if(typeof VERSION_OPTIONS==='undefined')return false;
 const list=VERSION_OPTIONS.paraphrase;
 if(!list.some(v=>v.code===TCW))list.push({code:TCW,name:'The Clear Word (local EPUB)'});
 return true;
}
function connected(){
 const s=document.getElementById('tcwPrivateStatus');
 return !!(s&&/^Connected to /i.test(s.textContent||''));
}
function bind(){
 if(!ensureTcwOption())return;
 try{syncSettingsUI()}catch{}
 const sel=document.getElementById('paraphraseVersion');
 if(!sel||sel.dataset.tcwBound)return;
 sel.dataset.tcwBound='1';
 sel.addEventListener('change',e=>{
  if(e.target.value!==TCW)return;
  if(connected())return;
  e.preventDefault();
  e.stopImmediatePropagation();
  try{settings.paraphrase='MSG';saveSettings();syncSettingsUI()}catch{}
  const b=document.getElementById('tcwOpenBtn');
  if(b)b.click();
 },true);
}
function run(){bind();setTimeout(bind,250);setTimeout(bind,1000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();
