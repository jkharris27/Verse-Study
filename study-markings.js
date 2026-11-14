/* Verse Study V4.58 — study notes, bookmarked passages, and collapsible study navigation. */
(function(){
'use strict';
var api=null, catalog=[], byChapter=new Map(), popupEpoch=0;
var DEFAULT_COLOR='#d2b36b';
var colorIsValid=function(value){return /^#[\da-f]{6}$/i.test(String(value||''))};
var el=function(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e};
var safeColor=function(v){return colorIsValid(v)?v:DEFAULT_COLOR};
var safeName=function(v){return String(v||'Untitled study').trim().slice(0,160)};
function parseRef(value){
 var raw=String(value||'').trim().replace(/[–—]/g,'-');
 /* Keep unresolvable source references visible in the sequence, but do not link or underline non-existent verses. */
 if(['1 Corinthians 6:23','Exodus 31:30'].includes(raw))return null;
 var m=raw.match(/^(.+?)\s+(\d+)(?::(\d+)(.*))?$/);
 if(!m||!api)return null;
 var b=api.bookByName(m[1]),ch=Number(m[2]),first=m[3]===undefined?1:Number(m[3]);
 if(!b||ch<1||ch>b.chapters||first<1)return null;
 var parts=m[3]===undefined?['1-999']:(String(first)+(m[4]||'')).split(',').map(x=>x.trim());
 var ranges=[];
 for(var p of parts){var n=p.match(/^(\d+)(?:-(\d+))?$/);if(!n)return null;var start=Number(n[1]),end=Number(n[2]||n[1]);if(start<1||end<start||end>999)return null;ranges.push({start:start,end:end})}
 return {book:b.id,chapter:ch,verse:ranges[0].start,ranges:ranges,raw:raw};
}
function normalize(st,source){
 var entries=Array.isArray(st.entries)?st.entries.map(x=>({ref:String(x.ref||''),note:String(x.note||''),label:String(x.label||''),markChapters:Array.isArray(x.markChapters)?x.markChapters:[]})):
  (Array.isArray(st.verses)?st.verses.map(x=>({ref:api&&api.isValidLocation(x)?api.refOf(x):''})):[]);
 return {id:String(st.id||('user-'+safeName(st.name))),name:safeName(st.name),code:String(st.code||''),source:source||st.source||'user',color:safeColor(st.color),subtitle:String(st.subtitle||''),entries:entries.map(x=>({...x,loc:parseRef(x.ref)})),original:st};
}
function rebuild(){
 if(!api)return;
 byChapter=new Map();
 catalog=[...(window.VS_MARKING_CATALOG||[]),...(window.VS_NUMBERED_LESSONS||[])].map(x=>normalize(x,x.source));
 catalog.push(...api.loadStudies().map((x,i)=>Object.assign(normalize(x,'user'),{userIndex:i})));
 for(var s of catalog)for(var i=0;i<s.entries.length;i++){
  var p=s.entries[i].loc;if(!p)continue;
  var chapters=s.entries[i].markChapters;
  if(Array.isArray(chapters)&&chapters.length){
   for(var ch of chapters){
    var chapterNum=Number(ch);if(!Number.isInteger(chapterNum)||chapterNum<1)continue;
    var chapterKey=p.book+':'+chapterNum;
    if(!byChapter.has(chapterKey))byChapter.set(chapterKey,[]);
    byChapter.get(chapterKey).push({study:s,index:i,loc:{book:p.book,chapter:chapterNum,verse:1,ranges:[{start:1,end:999}],raw:p.raw}});
   }
  }else{
   var key=p.book+':'+p.chapter;
   if(!byChapter.has(key))byChapter.set(key,[]);
   byChapter.get(key).push({study:s,index:i,loc:p});
  }
 }
}
function findVerse(book,chapter,verse){
 return (byChapter.get(book+':'+chapter)||[]).filter(x=>x.loc.ranges.some(r=>verse>=r.start&&verse<=r.end));
}
function openStudyChooser(hits,x,verse){
 var unique=[...new Map(hits.map(h=>[h.study.id,h])).values()];
 var body=document.getElementById('vsInfoBody');body.textContent='';
 body.appendChild(el('div','vs-study-subtitle','Choose a study containing this verse.'));
 unique.forEach(function(hit){
  var b=el('button','vs-study-chooser');
  var dot=el('span','vs-color-dot');dot.style.background=hit.study.color;
  var text=el('span','',hit.study.name);
  b.type='button';b.append(dot,text);
  b.onclick=function(){openStudy(hit.study,hit.index)};
  body.appendChild(b);
 });
 api.infoShow('Studies for '+api.refOf({book:x.book,chapter:x.chapter,verse:verse}),'Bible Markings · My Studies');
}
function isVerseBookmarked(book,chapter,verse){
 return api.loadBookmarks().some(function(b){return Number(b.book)===Number(book)&&Number(b.chapter)===Number(chapter)&&Number(b.verse)===Number(verse)});
}
function refreshBookmarkMarkings(x){
 if(!api||!x)return;
 document.querySelectorAll('.verse-line[data-verse]').forEach(function(row){
  var v=Number(row.dataset.verse),txt=row.querySelector('.verse-text');
  if(!txt)return;
  var marked=findVerse(Number(x.book),Number(x.chapter),v).length>0;
  txt.classList.toggle('vs-bookmarked-text',!marked&&isVerseBookmarked(x.book,x.chapter,v));
 });
}
function addVerseMarking(row,x,verse){
 if(!api)return;
 var matches=findVerse(Number(x.book),Number(x.chapter),Number(verse));
 var text=row.querySelector('.verse-text');
 if(text)text.classList.toggle('vs-bookmarked-text',!matches.length&&isVerseBookmarked(x.book,x.chapter,verse));
 if(!matches.length)return;
 var unique=[...new Map(matches.map(hit=>[hit.study.id,hit])).values()];
 if(text){
  text.classList.add('vs-marked-text');
  text.style.setProperty('--vs-mark-color',unique[0].study.color);
  text.title='Bible marking: '+unique.map(m=>m.study.name).join(', ');
 }
 var tools=row.querySelector('.vs-verse-tools');
 if(!tools){tools=el('div','vs-verse-tools');row.appendChild(tools)}
 var b=el('button','vs-verse-tool vs-study-tool',unique.length===1?'▤ '+unique[0].study.name:'▤ Studies ('+unique.length+')');
 b.type='button';b.style.borderLeft='3px solid '+unique[0].study.color;
 b.title=unique.map(m=>m.study.name).join(', ');
 b.onclick=function(e){e.stopPropagation();if(unique.length===1)openStudy(unique[0].study,unique[0].index);else openStudyChooser(unique,x,verse)};
 tools.appendChild(b);
}
function displayEntryText(st,i){
 var ent=st.entries[i];
 return (ent.label||ent.ref||'Reference needs review');
}
function studyEntryNoteKey(st,index){
 var ent=st.entries[index],ref=String(ent.ref||ent.label||'unlisted');
 var previous=st.entries.slice(0,index).filter(function(e){return String(e.ref||e.label||'unlisted')===ref}).length;
 return ref+'#'+previous;
}
function loadEntryNote(st,index){
 var all=api.loadStudyNotes(),notes=all[st.id];
 return notes&&typeof notes[studyEntryNoteKey(st,index)]==='string'?notes[studyEntryNoteKey(st,index)]:'';
}
function saveEntryNote(st,index,value){
 var all=api.loadStudyNotes(),notes=all[st.id]&&typeof all[st.id]==='object'?all[st.id]:{};
 var key=studyEntryNoteKey(st,index);
 if(value)notes[key]=value;else delete notes[key];
 if(Object.keys(notes).length)all[st.id]=notes;else delete all[st.id];
 api.saveStudyNotes(all);
}
function openStudy(st,index){
 if(!api)return;
 popupEpoch++;
 var n=st.entries.length;if(!n)return;
 index=Math.max(0,Math.min(index,n-1));
 var body=document.getElementById('vsInfoBody');body.textContent='';
 var head=el('div','vs-study-popup-head');
 var dot=el('span','vs-color-dot');dot.style.background=st.color;
 var title=el('div','vs-study-popup-name',st.name);
 head.append(dot,title);body.appendChild(head);
 if(st.subtitle){body.appendChild(el('div','vs-study-subtitle',st.subtitle))}
 var ref=el('div','vs-study-ref');
 var verses=el('div','vs-study-passage');
 var nav=el('div','vs-study-nav');
 var prev=el('button','','← Previous'),next=el('button','','Next →'),read=el('button','','Open in Bible');
 [prev,next,read].forEach(b=>b.type='button');
 prev.onclick=function(){openStudy(st,index-1)};
 next.onclick=function(){openStudy(st,index+1)};
 read.onclick=function(){var p=st.entries[index].loc;if(p)api.goTo(p)};
 nav.append(prev,next);
 var notes=el('div','vs-study-notes');
 var notesLabel=el('label','vs-study-notes-label','My notes');
 var noteInput=el('textarea','vs-study-note-input');
 noteInput.rows=3;
 noteInput.placeholder='Add notes for this passage…';
 noteInput.value=loadEntryNote(st,index);
 var noteId='vs-study-note-'+Date.now()+'-'+index;
 noteInput.id=noteId;notesLabel.htmlFor=noteId;
 noteInput.addEventListener('input',function(){saveEntryNote(st,index,noteInput.value)});
 notes.append(notesLabel,noteInput);
 body.append(ref,verses,notes,nav,read);
 read.className='vs-study-read';
 var all=el('div','vs-study-all');
 all.appendChild(el('div','vs-study-small-title','Study sequence'));
 var list=el('div','vs-study-list');
 st.entries.forEach(function(entry,j){
  var b=el('button','vs-study-list-row',String(j+1)+'. '+displayEntryText(st,j));
  b.type='button';if(j===index)b.classList.add('active');
  b.onclick=function(){openStudy(st,j)};
  list.appendChild(b);
 });
 all.appendChild(list);body.appendChild(all);
 if(st.source==='user'){
  var editor=el('div','vs-study-editor');
  var add=el('button','','+ Add '+api.refOf(api.current()));
  add.onclick=function(){var next=changePersonal(st,function(original){if(Array.isArray(original.entries))original.entries.push({ref:api.refOf(api.current())});else{original.verses=Array.isArray(original.verses)?original.verses:[];original.verses.push({...api.current()})}});if(next)openStudy(next,next.entries.length-1)};
  var up=el('button','','Move up'),down=el('button','','Move down'),remove=el('button','','Remove step');
  function move(offset){var next=changePersonal(st,function(original){var arr=Array.isArray(original.entries)?original.entries:original.verses;if(!Array.isArray(arr))return;var target=index+offset;if(target<0||target>=arr.length)return;var item=arr[index];arr[index]=arr[target];arr[target]=item});if(next)openStudy(next,index+offset)}
  up.onclick=function(){move(-1)};down.onclick=function(){move(1)};
  remove.onclick=function(){if(n===1)return alert('A study needs at least one verse.');var next=changePersonal(st,function(original){var arr=Array.isArray(original.entries)?original.entries:original.verses;if(Array.isArray(arr))arr.splice(index,1)});if(next)openStudy(next,Math.min(index,next.entries.length-1))};
  up.disabled=index===0;down.disabled=index===n-1;remove.disabled=n===1;
  [add,up,down,remove].forEach(b=>{b.type='button';editor.appendChild(b)});body.appendChild(editor);
 }
 var p=st.entries[index].loc;
 ref.textContent=displayEntryText(st,index);
 prev.disabled=index===0;next.disabled=index===n-1;
 read.disabled=!p;
 api.infoShow(st.name,st.source==='markings'?'Bible Markings · '+st.code:(st.source==='lessons'?'Numbered Bible Studies':'My Studies'));
 if(!p){verses.textContent='Reference needs review against the source photograph.';return}
 verses.textContent='Loading passage…';
 var stamp=popupEpoch,precise=api.settings().precise;
 api.getChapter(precise,p).then(function(chapter){
  if(stamp!==popupEpoch)return;
  var entries=api.chapterRows(chapter)||[];
  var rows=entries.filter(function(v){return p.ranges.some(r=>Number(v.verse)>=r.start&&Number(v.verse)<=r.end)});
  var limited=rows.slice(0,14).map(v=>String(v.verse)+'  '+api.cleanBibleText(v.text||''));
  verses.textContent=limited.join('\n')+(rows.length>14?'\n… Open in Bible for more.':'');
  if(!verses.textContent.trim())verses.textContent='Passage text unavailable. Open it in the Bible view.';
 }).catch(function(){if(stamp===popupEpoch)verses.textContent='Passage text unavailable. Open it in the Bible view.'});
}
function addTitle(box,title){box.appendChild(el('div','saved-title',title))}
function studyButton(st){
 var row=el('div','vs-study-picker-row');row.dataset.name=st.name.toLowerCase();
 var dot=el('span','vs-color-dot');dot.style.background=st.color;
 var button=el('button','study-open',st.name);button.type='button';button.onclick=function(){openStudy(st,0)};
 row.append(dot,button);
 var meta=el('span','vs-study-picker-meta',st.source==='markings'?st.code:String(st.entries.length));
 row.appendChild(meta);
 return row;
}
function group(box,label,items,openDefault){
 var details=el('details','vs-study-picker-group');details.open=!!openDefault;
 var summary=el('summary','',label+' ('+items.length+')');details.appendChild(summary);
 items.forEach(st=>details.appendChild(studyButton(st)));
 box.appendChild(details);
 return details;
}
function changePersonal(st,edit){
 var saved=api.loadStudies(),i=Number(st.userIndex);
 if(!Number.isInteger(i)||i<0||!saved[i])return null;
 edit(saved[i]);api.saveStudies(saved);rebuild();api.render();
 return catalog.find(x=>x.source==='user'&&x.userIndex===i)||null;
}
function savePersonalStudy(name,locations,color){
 var existing=api.loadStudies(),title=String(name||'').trim();if(!title)return;
 existing.push({id:'study-'+Date.now(),name:title,color:safeColor(color),verses:locations});
 api.saveStudies(existing);rebuild();api.render();renderPicker();
}
function renderPicker(){
 if(!api)return;
 rebuild();
 var box=document.getElementById('savedPickerSection');box.textContent='';
 addTitle(box,'Preloaded Studies');
 var input=el('input','vs-study-filter');input.type='search';input.placeholder='Search studies by title…';input.setAttribute('aria-label','Filter studies');
 box.appendChild(input);
 var marks=catalog.filter(x=>x.source==='markings'),lessons=catalog.filter(x=>x.source==='lessons');
 group(box,'Bible Markings',marks,false);
 group(box,'Numbered Bible Studies',lessons,false);
 var mine=catalog.filter(x=>x.source==='user');
 var minePanel=el('details','vs-study-picker-group');
 minePanel.appendChild(el('summary','','My Studies ('+mine.length+')'));
 box.appendChild(minePanel);
 var newBtn=el('button','save-study-btn','+ New study starting with '+api.refOf(api.current()));
 newBtn.type='button';newBtn.onclick=function(){
  var name=prompt('Name your new study:');if(!name||!name.trim())return;
  savePersonalStudy(name,[api.current()],DEFAULT_COLOR);
 };minePanel.appendChild(newBtn);
 if(!mine.length)minePanel.appendChild(el('div','saved-empty','Create a study or select bookmarks below to make one.'));
 mine.forEach(function(st,i){
  var row=el('div','vs-personal-row');row.dataset.name=st.name.toLowerCase();
  var picker=el('input','vs-study-color-input');picker.type='color';picker.value=st.color;picker.title='Change study underline color';picker.setAttribute('aria-label','Change color for '+st.name);
  picker.onchange=function(){
   var saved=api.loadStudies();if(!saved[i])return;saved[i].color=picker.value;api.saveStudies(saved);rebuild();api.render();renderPicker();
  };
  var open=el('button','study-open',st.name);open.onclick=function(){openStudy(st,0)};
  var rename=el('button','saved-delete','✎');rename.title='Rename study';rename.setAttribute('aria-label','Rename '+st.name);
  rename.onclick=function(){var name=prompt('Rename study:',st.name);if(!name||!name.trim())return;var saved=api.loadStudies();if(!saved[i])return;saved[i].name=name.trim();api.saveStudies(saved);rebuild();renderPicker()};
  var del=el('button','saved-delete','×');del.title='Delete study';del.setAttribute('aria-label','Delete '+st.name);
  del.onclick=function(){if(!confirm('Delete study "'+st.name+'"?'))return;var saved=api.loadStudies();saved.splice(i,1);api.saveStudies(saved);rebuild();api.render();renderPicker()};
  row.append(picker,open,rename,del);minePanel.appendChild(row);
 });
 var bookmarks=api.loadBookmarks();
 var bookmarkPanel=el('details','vs-study-picker-group');
 bookmarkPanel.appendChild(el('summary','','Bookmarks ('+bookmarks.length+')'));
 box.appendChild(bookmarkPanel);
 if(!bookmarks.length)bookmarkPanel.appendChild(el('div','saved-empty','No bookmarks saved yet.'));
 else{
  bookmarks.forEach(function(b,i){
   var row=el('div','saved-row');
   var cb=el('input','study-select');cb.type='checkbox';cb.value=String(i);
   var link=el('button','saved-link',api.refOf(b));link.onclick=function(){api.goTo(b)};
   var del=el('button','saved-delete','×');del.setAttribute('aria-label','Delete bookmark '+api.refOf(b));
   del.onclick=function(){var saved=api.loadBookmarks();saved.splice(i,1);api.saveBookmarks(saved);api.updateBookmarkUI();renderPicker()};
   row.append(cb,link,del);bookmarkPanel.appendChild(row);
  });
  var save=el('button','save-study-btn','Save selected bookmarks as a study');
  save.onclick=function(){
   var chosen=[...box.querySelectorAll('.study-select:checked')].map(cb=>bookmarks[Number(cb.value)]).filter(Boolean);
   if(!chosen.length)return alert('Select at least one bookmark.');
   var existing=bookmarkPanel.querySelector('.vs-study-create-form');
   if(existing){existing.remove();return}
   var form=el('form','vs-study-create-form');
   var name=el('input','vs-study-name-input');
   name.type='text';name.placeholder='Study name';name.maxLength=160;name.required=true;name.setAttribute('aria-label','Study name');
   var colorLabel=el('label','vs-study-color-label','Solid underline color');
   var color=el('input','vs-study-color-input');color.type='color';color.value=DEFAULT_COLOR;color.setAttribute('aria-label','Choose study color');
   colorLabel.appendChild(color);
   var actions=el('div','vs-study-create-actions');
   var create=el('button','save-study-btn','Create study');create.type='submit';
   var cancel=el('button','save-study-btn','Cancel');cancel.type='button';cancel.onclick=function(){form.remove()};
   actions.append(create,cancel);
   form.append(name,colorLabel,actions);
   form.addEventListener('submit',function(e){e.preventDefault();var title=name.value.trim();if(!title)return;savePersonalStudy(title,chosen,color.value)});
   bookmarkPanel.appendChild(form);name.focus();
  };
  bookmarkPanel.appendChild(save);
 }
 input.oninput=function(){var q=input.value.trim().toLowerCase();box.querySelectorAll('[data-name]').forEach(r=>r.hidden=!!q&&!r.dataset.name.includes(q));if(q)box.querySelectorAll('details.vs-study-picker-group').forEach(d=>d.open=true)};
}
function connect(helpers){api=helpers;rebuild()}
window.VS_STUDIES={connect:connect,rebuild:rebuild,decorateVerse:addVerseMarking,refreshBookmarkMarkings:refreshBookmarkMarkings,renderPicker:renderPicker,openStudy:openStudy};
})();