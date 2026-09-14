(()=>{
const VERSION='V4.20';
function applyVersion(){
 for(const el of document.querySelectorAll('div')){
  if(el.children.length===0&&/V4\.(?:6|7|8|9|10|11|12|13|14|15|16|17|18|19|20)/.test(el.textContent||'')){
   el.textContent=el.textContent.replace(/V4\.(?:6|7|8|9|10|11|12|13|14|15|16|17|18|19|20)/g,VERSION);
  }
 }
}
window.VERSE_STUDY_VERSION=VERSION;
applyVersion();
setTimeout(applyVersion,250);
setTimeout(applyVersion,1000);
setTimeout(applyVersion,3000);
})();
