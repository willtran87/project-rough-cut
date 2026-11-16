/* Menu depth: slow ground mist across the chapter preview and a gentle parallax
   that follows the pointer. The mist stays inside the picture, clear of all text. It moves only while the grass atmosphere moves (focused, visible,
   no dialog, reduced motion off), writes transforms and opacity only, and stops
   its frame loop as soon as the menu is hidden, blurred or still. */
(() => {
 const panel=document.getElementById('course-menu'),feature=panel?.querySelector('.course-menu-feature'),caption=feature?.querySelector('figcaption');if(!caption)return;
 const layer=document.createElement('div');layer.className='menu-mist';layer.setAttribute('aria-hidden','true');
 layer.innerHTML='<i class="menu-mist-moon"></i><i class="menu-mist-far"></i><i class="menu-mist-near"></i>';caption.before(layer);
 const [moon,far,near]=layer.children,pictures=()=>feature.querySelectorAll(':scope>img');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover: hover) and (pointer: fine)');
 let raf=null,last=0,time=0,frames=0,targetX=0,targetY=0,x=0,y=0,parallax=false;
 const still=()=>reduced.matches||panel.dataset.reduced==='true';
 const moving=()=>!panel.hidden&&panel.dataset.atmosphere==='moving'&&!still();
 function place(){
  // Each band is two panels wide with a repeating half, so the loop has no seam.
  far.style.transform=`translate3d(${(-(time*.55%50)).toFixed(3)}%,${(Math.sin(time*.11)*6).toFixed(1)}px,0)`;
  near.style.transform=`translate3d(${((time*.85%50)-50).toFixed(3)}%,${(Math.cos(time*.09)*8).toFixed(1)}px,0)`;
  moon.style.opacity=(.62+.2*Math.sin(time*.23)+.06*Math.sin(time*.71)).toFixed(3);
  if(!parallax)return;
  // Two depths inside the preview frame: the painting, then the mist in front of it.
  // The full-screen backdrop stays put so the panel never gains scrollable overflow.
  for(const img of pictures())img.style.transform=`translate3d(${(-x*7).toFixed(2)}px,${(-y*4).toFixed(2)}px,0) scale(1.04)`;
  layer.style.transform=`translate3d(${(-x*13).toFixed(2)}px,${(-y*6).toFixed(2)}px,0)`;
 }
 function frame(now){
  raf=null;if(!moving())return;
  const dt=Math.min(100,now-last)/1000;last=now;time+=dt;frames++;
  const k=1-Math.exp(-dt*4.5);x+=(targetX-x)*k;y+=(targetY-y)*k;
  place();raf=requestAnimationFrame(frame);
 }
 function reconcile(){
  const want=fine.matches&&!still();
  if(want!==parallax){
   parallax=want;panel.dataset.parallax=String(want);
   if(!want){targetX=targetY=x=y=0;layer.style.transform='';for(const img of pictures())img.style.transform='';}
   else place();
  }
  if(!moving()){if(raf!==null)cancelAnimationFrame(raf);raf=null;return;}
  if(raf===null){last=performance.now();raf=requestAnimationFrame(frame);}
 }
 panel.addEventListener('pointermove',event=>{
  if(!parallax||event.pointerType==='touch')return;
  // Viewport-relative, so no layout is read while the pointer moves.
  targetX=Math.max(-1,Math.min(1,event.clientX/Math.max(1,innerWidth)*2-1));targetY=Math.max(-1,Math.min(1,event.clientY/Math.max(1,innerHeight)*2-1));
 },{passive:true});
 panel.addEventListener('pointerleave',()=>{targetX=targetY=0;});
 new MutationObserver(reconcile).observe(panel,{attributes:true,attributeFilter:['data-atmosphere','data-reduced','hidden']});
 reduced.addEventListener('change',reconcile);fine.addEventListener('change',reconcile);
 place();reconcile();
 window.RCMenuMotion={stats:()=>({scheduled:raf!==null,frames,time:time*1000,parallax,offset:[x,y]})};
})();
