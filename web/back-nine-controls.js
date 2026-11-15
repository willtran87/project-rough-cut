const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const chaseDeadzone=value=>Number.isFinite(value)?clamp(value,.1,.3):.22;
// Each steering axis is independent: moving forward must not reintroduce
// horizontal stick drift. Rescale the live range so turning starts smoothly
// just outside the deadzone and full deflection still gives full control.
export function chaseStickAxis(value,deadzone){
 if(!Number.isFinite(value))return 0;
 const d=chaseDeadzone(deadzone);
 return Math.sign(value)*clamp((Math.abs(value)-d)/(1-d),0,1);
}
export function createChaseControls(canvas,getRun,settings){
 const key='rough-cut.chase-comfort.v1';let prefs={shake:.65,flash:.65,routeHints:false};
 try{prefs={...prefs,...JSON.parse(localStorage.getItem(key)||'{}')};}catch{}
 for(const [name,min,max]of [['shake',0,1],['flash',0,1]])prefs[name]=clamp(Number.isFinite(+prefs[name])?+prefs[name]:1,min,max);
 const save=()=>{try{localStorage.setItem(key,JSON.stringify(prefs));}catch{}};
 for(const name of ['shake','flash']){const el=document.getElementById('chase-'+name);el.value=prefs[name];el.addEventListener('input',()=>{prefs[name]=+el.value;save();});}
 prefs.routeHints=prefs.routeHints===true;const hints=document.getElementById('chase-route-hints');if(hints){hints.checked=prefs.routeHints;hints.addEventListener('change',()=>{prefs.routeHints=hints.checked;save();});}
 // Driving and running both use steering; the mouse never captures the view.
 function reset(){if(document.pointerLockElement===canvas)document.exitPointerLock();}
 return {prefs,reset,sample(){return {};}};
}
