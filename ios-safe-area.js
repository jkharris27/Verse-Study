(()=>{
const style=document.createElement('style');
style.textContent=`
/* Keep top navigation clear of iPhone Dynamic Island/notch/camera areas. */
header{padding-top:calc(14px + env(safe-area-inset-top,0px))!important}
.pickerhead{padding-top:calc(18px + env(safe-area-inset-top,0px))!important}
.overlay{padding-top:0!important}
@supports(padding:max(0px)){
 header{padding-top:max(14px,calc(env(safe-area-inset-top) + 10px))!important}
 .pickerhead{padding-top:max(18px,calc(env(safe-area-inset-top) + 10px))!important}
}
`;
document.head.appendChild(style);
for(const el of document.querySelectorAll('div')){
 if(el.children.length===0&&/V4\.1[4-9]|V4\.20/.test(el.textContent||''))el.textContent=el.textContent.replace(/V4\.1[4-9]|V4\.20/,'V4.15');
}
})();