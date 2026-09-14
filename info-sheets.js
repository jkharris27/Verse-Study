(()=>{
const style=document.createElement('style');
style.textContent=`.vs-info-backdrop{position:fixed;inset:0;background:#000a;z-index:180;display:none;place-items:center;padding:22px}.vs-info-backdrop.show{display:grid}.vs-info-popup{width:min(92vw,520px);max-height:min(72vh,620px);overflow:auto;background:var(--panel);border:1px solid var(--line);border-radius:18px;padding:18px 18px 20px;box-shadow:0 18px 60px #000a}.vs-info-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}.vs-info-title{font-size:19px;font-weight:800;color:var(--cream)}.vs-info-close{border:0;background:transparent;color:var(--muted);font-size:30px;line-height:1;padding:0 3px}.vs-info-body{line-height:1.5;margin-top:10px}.vs-info-source{font-size:12px;color:var(--muted);margin-top:14px}`;
document.head.appendChild(style);
const layer=document.createElement('div');
layer.id='vsInfoLayer';layer.className='vs-info-backdrop';layer.setAttribute('aria-hidden','true');
layer.innerHTML='<div class="vs-info-popup" role="dialog" aria-modal="true" aria-labelledby="vsInfoTitle"><div class="vs-info-head"><div id="vsInfoTitle" class="vs-info-title">Note</div><button id="vsInfoClose" class="vs-info-close" aria-label="Close">×</button></div><div id="vsInfoBody" class="vs-info-body"></div><div id="vsInfoSource" class="vs-info-source"></div></div>';
document.body.appendChild(layer);
function close(){layer.classList.remove('show');layer.setAttribute('aria-hidden','true')}
function open(title,body,source=''){document.getElementById('vsInfoTitle').textContent=title||'Note';document.getElementById('vsInfoBody').textContent=body||'';document.getElementById('vsInfoSource').textContent=source||'';layer.classList.add('show');layer.setAttribute('aria-hidden','false')}
document.getElementById('vsInfoClose').onclick=close;
layer.addEventListener('click',e=>{if(e.target===layer)close()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
window.VerseStudyInfo={open,close};
for(const el of document.querySelectorAll('div'))if(el.children.length===0&&/V4\.1[4-9]|V4\.20/.test(el.textContent||''))el.textContent=el.textContent.replace(/V4\.1[4-9]|V4\.20/,'V4.18');
})();