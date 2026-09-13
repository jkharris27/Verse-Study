// Verse Study V4.5 Hebrew -> ESV word mapping
// ESV Strong's tagging data: Tyndale House, Cambridge / STEP Bible (CC BY-NC 4.0)
// Source: https://github.com/STEPBible/STEPBible-Data/tree/master/Tagged-Bibles

(() => {
  const TTESV_URL = 'https://raw.githubusercontent.com/STEPBible/STEPBible-Data/master/Tagged-Bibles/TTESV%20-%20Tyndale%20Translation%20tags%20for%20ESV%20-%20TyndaleHouse.com%20STEPBible.org%20CC%20BY-NC.txt';
  const TTESV_BOOKS = {
    1:'Gen',2:'Exo',3:'Lev',4:'Num',5:'Deu',6:'Jos',7:'Jdg',8:'Rut',9:'1Sa',10:'2Sa',
    11:'1Ki',12:'2Ki',13:'1Ch',14:'2Ch',15:'Ezr',16:'Neh',17:'Est',18:'Job',19:'Psa',
    20:'Pro',21:'Ecc',22:'Sng',23:'Isa',24:'Jer',25:'Lam',26:'Eze',27:'Dan',28:'Hos',
    29:'Joe',30:'Amo',31:'Oba',32:'Jon',33:'Mic',34:'Nah',35:'Hab',36:'Zep',37:'Hag',38:'Zec',39:'Mal'
  };

  let ttesvTextPromise = null;
  const originalLoadWordStudy = loadWordStudy;

  function cleanEsvToken(s){
    return String(s||'').replace(/^[“”‘’"'([{]+|[“”‘’"')\]},.;:!?]+$/g,'');
  }

  async function getTtesvText(){
    if(ttesvTextPromise) return ttesvTextPromise;
    ttesvTextPromise = (async()=>{
      if('caches' in window){
        const cache = await caches.open('verse-study-ttesv-v1');
        let r = await cache.match(TTESV_URL);
        if(!r){
          r = await fetch(TTESV_URL,{cache:'force-cache'});
          if(!r.ok) throw new Error('TTESV source '+r.status);
          await cache.put(TTESV_URL,r.clone());
        }
        return await r.text();
      }
      const r = await fetch(TTESV_URL,{cache:'force-cache'});
      if(!r.ok) throw new Error('TTESV source '+r.status);
      return await r.text();
    })();
    return ttesvTextPromise;
  }

  function parseVerseTags(line){
    const map = new Map();
    const fields = String(line||'').split('\t').slice(1);
    for(const field of fields){
      const m = field.match(/^([0-9+]+)=([\s\S]+)$/);
      if(!m) continue;
      const positions = m[1].split('+').map(Number).filter(Boolean);
      const strongs = Array.from(m[2].matchAll(/<(\d{4,5})>/g),x=>'H'+String(Number(x[1])));
      for(const strong of strongs){
        if(!map.has(strong)) map.set(strong,positions);
      }
    }
    return map;
  }

  async function verseStrongMap(x){
    const cacheKey = `vs45_ttesv_${x.book}_${x.chapter}_${x.verse}`;
    const saved = SAFE_STORAGE.getItem(cacheKey);
    if(saved){
      try{return new Map(JSON.parse(saved))}catch(e){}
    }
    const code = TTESV_BOOKS[x.book];
    if(!code) return new Map();
    const text = await getTtesvText();
    const marker = `$${code} ${x.chapter}:${x.verse}\t`;
    const start = text.indexOf(marker);
    if(start<0) return new Map();
    const end = text.indexOf('\n',start);
    const line = text.slice(start,end<0?text.length:end).replace(/\r$/,'');
    const map = parseVerseTags(line);
    try{SAFE_STORAGE.setItem(cacheKey,JSON.stringify(Array.from(map.entries())))}catch(e){}
    return map;
  }

  function wordsAtPositions(esv,positions){
    const words = String(esv||'').trim().split(/\s+/);
    return positions.map(n=>cleanEsvToken(words[n-1])).filter(Boolean).join(' ');
  }

  function legacyHebrewEsvWord(w){
    const candidates=(w.usage||w.meaning).split(/[,;()]/).map(s=>s.replace(/[×]/g,'').trim()).filter(Boolean);
    return candidates.map(c=>({c,n:normEnglish(c)})).find(({n})=>n&&(' '+normEnglish(currentESVText)+' ').includes(' '+n+' '))?.c||'';
  }

  loadWordStudy = async function(x){
    if(x.book>=40) return originalLoadWordStudy(x);
    const el=$('wordStudy'),title=$('wordStudyTitle');if(!el||!title)return;
    title.textContent='Word Study · Hebrew';
    el.textContent='Loading Hebrew word study…';
    try{
      const [raw,tags] = await Promise.all([hebrewWordData(x),verseStrongMap(x).catch(()=>new Map())]);
      const arr=raw.sort((a,b)=>hebrewWordScore(b)-hebrewWordScore(a));
      const chosen=[],seen=new Set();
      for(const w of arr){
        if(hebrewWordScore(w)<1||!w.strong||seen.has(w.strong))continue;
        seen.add(w.strong);chosen.push(w);if(chosen.length===5)break;
      }
      if(!chosen.length){el.textContent='No key lexical entries found for this verse.';return}
      el.innerHTML=chosen.map(w=>{
        const mapped=wordsAtPositions(currentESVText,tags.get(w.strong)||[]);
        const esv=mapped||legacyHebrewEsvWord(w)||'not directly tagged';
        const sense=w.meaning||w.usage||'Definition unavailable';
        const grammar=hebrewGrammar(w.morph);
        return `<div class="wordrow">
          <div><span class="originalword" dir="rtl">${esc(w.text)}</span>${w.xlit?`<span class="wordmeta">${esc(w.xlit)}</span>`:''}<span class="wordmeta">${esc(w.strong)}</span></div>
          <div class="wordmeaning"><b>ESV word:</b> ${esc(esv)} &nbsp; <b>Meaning:</b> ${esc(sense)}</div>
          <div class="wordmeaning"><b>Word study:</b> This ${esc(grammar)} carries the lexical sense “${esc(sense)}.”</div>
          <div class="wordgrammar"><b>Grammar:</b> ${esc(grammar)}${w.pron?` · Pronounced ${esc(w.pron)}`:''}</div>
        </div>`;
      }).join('') + '<div class="wordsource">ESV word mapping: Tyndale House, Cambridge / STEP Bible · CC BY-NC 4.0</div>';
    }catch(e){
      el.innerHTML='<div class="small">Hebrew word study could not load. The verse translations are unaffected.</div>';
    }
  };

  if(current && current.book<40 && currentESVText){
    loadWordStudy({...current});
  }
})();
