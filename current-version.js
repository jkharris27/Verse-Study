(()=>{
const VERSION='V4.20';
const versionRe=/V4\.(?:\d+(?:\.\d+)?)/g;
function applyVersion(){
 const h1=document.querySelector('header h1');
 if(h1){
  const titleBox=h1.parentElement;
  const ref=document.getElementById('headerRef');
  if(ref)ref.style.display='none';
  let build=titleBox?.querySelector('[data-vs-build]');
  if(!build&&titleBox){
   build=document.createElement('div');
   build.setAttribute('data-vs-build','');
   build.style.cssText='font-size:10px;opacity:.65;margin-top:2px';
   titleBox.appendChild(build);
  }
  if(build)build.textContent=`Build: Sep 13, 2026 · ${VERSION}`;
  if(titleBox){
   for(const el of [...titleBox.children]){
    if(el!==h1&&el!==ref&&el!==build&&/Build:/.test(el.textContent||''))el.style.display='none';
   }
  }
 }
 for(const el of document.querySelectorAll('.aboutline')){
  if(/Version:/i.test(el.textContent||''))el.innerHTML=`<b>Version:</b> ${VERSION}`;
 }
}
window.VERSE_STUDY_VERSION=VERSION;
applyVersion();
const observer=new MutationObserver(()=>applyVersion());
observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true});
setTimeout(applyVersion,250);
setTimeout(applyVersion,1000);
setTimeout(applyVersion,3000);
setTimeout(applyVersion,8000);
})();