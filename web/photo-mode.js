// Shared photo mode. The chapter owns pausing and the camera; this module owns
// the on-screen bar, the look/zoom input and saving the picture.
//
//   const photo=createPhotoMode({canvas, shell, renderNow, onEnter, onExit, onLook, onZoom, onMove});
//   photo.toggle()            enter or leave (chapters bind this to P while paused)
//   photo.active              true while open
//
// While active, <html data-photo-mode="true"> is set; each chapter hides its HUD
// with a CSS rule on that attribute. renderNow() must draw one frame
// synchronously so the canvas can be read in the same task.
export function createPhotoMode({canvas,shell=document.body,renderNow=()=>{},onEnter=()=>{},onExit=()=>{},onLook=()=>{},onZoom=()=>{},onMove=()=>{},name='rough-cut'}={}){
 const bar=document.createElement('div');bar.className='photo-bar';bar.hidden=true;bar.setAttribute('role','toolbar');bar.setAttribute('aria-label','Photo mode');
 bar.innerHTML='<span class="photo-hint">Drag to look · wheel to zoom · WASD to move</span><button type="button" data-photo="save">Save picture</button><button type="button" data-photo="close">Close</button>';
 bar.style.cssText='position:absolute;left:50%;bottom:18px;transform:translateX(-50%);z-index:60;display:flex;gap:10px;align-items:center;padding:8px 12px;background:rgba(8,14,10,.82);color:#e8f0d8;font:13px/1.3 system-ui,sans-serif;border:1px solid rgba(232,240,216,.25);border-radius:4px';
 const hideBar=()=>{bar.style.display=bar.hidden?'none':'flex';};
 shell.append(bar);hideBar();
 let active=false,drag=null,saved=0;const keys=new Set();
 const status=bar.querySelector('.photo-hint');
 function save(){
  // Hide the bar for the capture frame; the canvas itself never contains HUD.
  try{renderNow();}catch{}
  const done=blob=>{
   if(!blob){status.textContent='Could not save the picture.';return;}
   const url=URL.createObjectURL(blob),a=document.createElement('a');
   a.href=url;a.download=`${name}-${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.png`;document.body.append(a);a.click();a.remove();
   setTimeout(()=>URL.revokeObjectURL(url),4000);saved++;status.textContent='Picture saved.';
  };
  try{canvas.toBlob(done,'image/png');}catch{done(null);}
 }
 const down=e=>{if(!active||e.button!==0)return;drag={x:e.clientX,y:e.clientY};canvas.setPointerCapture?.(e.pointerId);};
 const move=e=>{if(!active||!drag)return;onLook(e.clientX-drag.x,e.clientY-drag.y);drag={x:e.clientX,y:e.clientY};};
 const up=()=>{drag=null;};
 const wheel=e=>{if(!active)return;e.preventDefault();onZoom(Math.sign(e.deltaY));};
 const MOVES={KeyW:[0,1],KeyS:[0,-1],KeyA:[-1,0],KeyD:[1,0],ArrowUp:[0,1],ArrowDown:[0,-1],ArrowLeft:[-1,0],ArrowRight:[1,0]};
 const keydown=e=>{
  if(!active)return;
  if(e.code==='Escape'||e.code==='KeyP'){e.preventDefault();e.stopImmediatePropagation();api.exit();return;}
  if(e.code==='Enter'&&document.activeElement?.dataset?.photo===undefined){e.preventDefault();e.stopImmediatePropagation();save();return;}
  if(MOVES[e.code]){keys.add(e.code);e.preventDefault();e.stopImmediatePropagation();}
 };
 const keyup=e=>{keys.delete(e.code);};
 let raf=0,last=0;
 function tick(t){
  if(!active)return;const dt=Math.min(.05,(t-last)/1000||0);last=t;
  let x=0,y=0;for(const code of keys){x+=MOVES[code][0];y+=MOVES[code][1];}
  if(x||y)onMove(x,y,dt);
  raf=requestAnimationFrame(tick);
 }
 canvas.addEventListener('pointerdown',down);addEventListener('pointermove',move);addEventListener('pointerup',up);
 canvas.addEventListener('wheel',wheel,{passive:false});addEventListener('keydown',keydown,true);addEventListener('keyup',keyup,true);
 bar.querySelector('[data-photo="save"]').onclick=save;bar.querySelector('[data-photo="close"]').onclick=()=>api.exit();
 const api={
  get active(){return active;},
  get saved(){return saved;},
  enter(){if(active)return false;active=true;keys.clear();document.documentElement.dataset.photoMode='true';bar.hidden=false;hideBar();status.textContent='Drag to look · wheel to zoom · WASD to move';onEnter();last=performance.now();raf=requestAnimationFrame(tick);bar.querySelector('[data-photo="save"]').focus({preventScroll:true});return true;},
  exit(){if(!active)return false;active=false;drag=null;keys.clear();cancelAnimationFrame(raf);delete document.documentElement.dataset.photoMode;bar.hidden=true;hideBar();onExit();return true;},
  toggle(){return active?api.exit():api.enter();},
  save,
 };
 return api;
}
