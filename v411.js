(()=>{
// CSB support. The app presents the friendly code CSB while Bolls uses CSB17.
if(typeof VERSION_OPTIONS==='undefined'||typeof publicVerse!=='function')return;

if(!VERSION_OPTIONS.loose.some(v=>v.code==='CSB')){
 const nivIndex=VERSION_OPTIONS.loose.findIndex(v=>v.code==='NIV2011');
 const at=nivIndex>=0?nivIndex+1:VERSION_OPTIONS.loose.length;
 VERSION_OPTIONS.loose.splice(at,0,{code:'CSB',name:'Christian Standard Bible'});
}

const basePublicVerse=publicVerse;
publicVerse=async function(type,x){
 return basePublicVerse(type==='CSB'?'CSB17':type,x);
};

// Required CSB credit line in the app's About section.
const aboutHeading=[...document.querySelectorAll('.settings-section h2')].find(h=>h.textContent.trim()==='About Verse Study');
const aboutSection=aboutHeading?.closest('.settings-section');
if(aboutSection&&!document.getElementById('csbCopyright')){
 const credit=document.createElement('div');
 credit.id='csbCopyright';
 credit.className='settingsnote';
 credit.style.marginTop='10px';
 credit.textContent='Scripture quotations marked CSB have been taken from the Christian Standard Bible®, Copyright © 2017 by Holman Bible Publishers. Used by permission. Christian Standard Bible® and CSB® are federally registered trademarks of Holman Bible Publishers.';
 aboutSection.appendChild(credit);
}

// Keep a saved CSB choice across reloads. The base app loads before this enhancement,
// so rehydrate only when the stored loose translation is CSB.
try{
 const stored=JSON.parse(SAFE_STORAGE.getItem('verseStudy.settings')||'{}');
 if(stored.loose==='CSB'&&settings.loose!=='CSB'){
  settings={...settings,loose:'CSB'};
  syncSettingsUI();
  render();
 }
}catch{}

// Visible enhancement version.
for(const el of document.querySelectorAll('div')){
 if(el.children.length===0&&el.textContent?.includes('V4.10'))el.textContent=el.textContent.replace('V4.10','V4.11');
}
})();
