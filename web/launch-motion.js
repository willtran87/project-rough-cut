/* Support for the CSS-only loading and briefing art. No timers or animation loops.
   1. Marks <html data-rc-motion="reduced"> while the saved comfort setting asks for
      reduced motion, so the art can hold still.
   2. The renderer hides and re-shows #course-loading within each frame while the
      course prepares. That would restart every CSS animation on every frame, so
      the panel is marked data-rc-live while a frame ends with it showing. The
      style sheet keeps a live panel's boxes in place across the mid-frame flip. */
(() => {
 const root=document.documentElement;
 function sync(){
  let reduced=false;
  try{reduced=JSON.parse(localStorage.getItem('rough-cut.settings.v1'))?.reducedMotion===true;}catch{/* Storage failure leaves the system preference in charge. */}
  const value=reduced?'reduced':'full';
  if(root.dataset.rcMotion!==value)root.dataset.rcMotion=value;
 }
 let queued=false;
 function later(){if(queued)return;queued=true;setTimeout(()=>{queued=false;sync();},0);}
 sync();
 // Settings live in a dialog or details element; closing it, changing a field,
 // or showing the loading panel re-reads the saved value.
 document.addEventListener('change',later,true);
 window.addEventListener('storage',later);window.addEventListener('pageshow',later);
 document.addEventListener('DOMContentLoaded',()=>{
  new MutationObserver(later).observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});
  const loading=document.getElementById('course-loading');if(!loading)return;
  let live=false;
  // Runs once after each frame's changes, before the frame is painted.
  new MutationObserver(()=>{
   const showing=!loading.hidden;if(showing===live)return;
   live=showing;if(live){sync();loading.dataset.rcLive='';}else delete loading.dataset.rcLive;
  }).observe(loading,{attributes:true,attributeFilter:['hidden']});
 });
})();
