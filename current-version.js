(()=>{
const VERSION='V4.20';
const versionRe=/V4\.(?:\d+(?:\.\d+)?)/g;
function applyVersion(){
 for(const el of document.querySelectorAll('div')){
  if(el.children.length===0&&versionRe.test(el.textContent||'')){
   versionRe.lastIndex=0;
   el.textContent=el.textContent.replace(versionRe,VERSION);
  }
  versionRe.lastIndex=0;
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