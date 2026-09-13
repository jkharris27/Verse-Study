(()=>{
function cleanBibleText(text){
 return String(text||'')
  .replace(/([A-Za-zÀ-ÿ])\d{3,5}\b/g,'$1')
  .replace(/\s*\[\d+\]\s*/g,' ')
  .replace(/\s*[ⓐ-ⓩ]\s*/g,' ')
  .replace(/\s+/g,' ')
  .trim();
}
if(typeof publicVerse==='function'){
 const previousPublicVerse=publicVerse;
 publicVerse=async function(type,x){
  const r=await previousPublicVerse(type,x);
  if(type==='TCW')return r;
  return {...r,text:cleanBibleText(r?.text)};
 };
}
if(typeof buildVersionSelect==='function'){
 buildVersionSelect=function(id,value,category){
  const el=document.getElementById(id);if(!el)return;
  el.innerHTML='';
  VERSION_OPTIONS[category].forEach(v=>{const o=document.createElement('option');o.value=v.code;o.textContent=v.name;el.appendChild(o)});
  el.value=VERSION_OPTIONS[category].some(v=>v.code===value)?value:DEFAULT_SETTINGS[category];
 };
 try{syncSettingsUI()}catch{}
}
for(const el of document.querySelectorAll('div')){
 if(el.children.length===0&&/V4\.1[5-9]|V4\.20/.test(el.textContent||''))el.textContent=el.textContent.replace(/V4\.1[5-9]|V4\.20/,'V4.16');
}
try{render()}catch{}
})();