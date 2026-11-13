// Illustrated prologue. DOM presentation only: no game simulation, WebGL textures
// or new audio voices. Retain at most the current and next decoded illustrations.
export const OPENING_SLIDES = [
  {id:'01-last-shift',src:'./assets/optimized/level-one-opening/01-last-shift.webp',title:'The last shift',kicker:'5:47 PM · RELEASE NIGHT',
    lines:['You were ready to clock out when Joe assigned one last action item.', 'Carry the signed Night Order across the insurer’s executive golf course. Five minutes, he said.'],
    alt:'An empty, floodlit golf course beyond the south gate. Lanterns trace a wet path beside a mist-covered pond.',sound:'Wind over the pond. A distant engine.',motor:.009,hz:45,wind:.014,hum:.0015},
  {id:'02-instructions',src:'./assets/optimized/level-one-opening/02-instructions.webp',title:'Three empty boxes',kicker:'THE NIGHT ORDER',
    lines:['Audit Bell. Field Log. Release Review. Three checks before the far-side office can release you.', 'Someone has written beneath the instructions: “If he stops mowing, keep moving.”'],
    alt:'A worn desk holds the Night Order, three empty stamp boxes, a handwritten warning and a map showing a shed and a culvert.',sound:'The desk lamp hums. The mower is still outside.',motor:.015,hz:48,wind:.009,hum:.004},
  {id:'03-still-working',src:'./assets/optimized/level-one-opening/03-still-working.webp',title:'Someone still working',kicker:'THE TURF-TELEMETRY PILOT',
    lines:['The course is Joe’s latest test site. He controls the gates, the lights—even the sprinklers.', 'Across the fairway, he is still mowing. He hasn’t changed out of his office clothes.'],
    alt:'Joe, in his black sweater and checked collar, pushes an old mower across the empty wet fairway beneath floodlights.',sound:'The engine carries across the empty fairway.',motor:.034,hz:56,wind:.012,hum:.002},
  {id:'04-gate-closed',src:'./assets/optimized/level-one-opening/04-gate-closed.webp',title:'The way back closes',kicker:'SOUTH SERVICE GATE',
    lines:['Behind you, the gate locks. Your task is already marked done.', 'The map shows two ways out beyond the field checks: the maintenance shed and the drainage culvert.'],
    alt:'A chain and padlock secure the timber gate. A weathered shed and a barred stone culvert suggest other ways out.',sound:'Wind against the locked gate. The mower sounds closer.',motor:.05,hz:61,wind:.013,hum:.002},
  {id:'05-engine-stops',src:'./assets/optimized/level-one-opening/05-engine-stops.webp',title:'The engine stops',kicker:'ACCEPTANCE REVIEW',
    lines:['The tracks turn toward you. Then the engine falls silent.', 'Joe is looking straight at you. You still have three boxes to fill.'],
    alt:'Fresh mower tracks lead through low mist to Joe. His mower is still, and he has turned to face you.',sound:'The engine cuts out. Only the wind remains.',motor:0,hz:42,wind:.007,hum:0},
];
export function createOpeningStory({finish,onSlide,onGesture,reducedMotion,captions,toggleFullscreen,
  slides=OPENING_SLIDES,storageKey='rough-cut.opening-story.v1',header='BEFORE THE ROUND',replayHint='Replay it from the clubhouse menu.',mount=document.getElementById('game-shell'),advanceKeys=['Enter','Space'],finalLabel='Open game guide →'}){
  const saved=()=>{try{return JSON.parse(localStorage.getItem(storageKey))||{};}catch{return {};}};
  const dialog=document.createElement('dialog');dialog.id='opening-story';dialog.tabIndex=-1;
  dialog.setAttribute('aria-labelledby','opening-title');dialog.setAttribute('aria-describedby','opening-copy');
  dialog.innerHTML=`<div class="opening-layout">
    <header class="opening-header"><span>ROUGH CUT <i>/</i> BEFORE THE ROUND</span><button type="button" data-opening="skip">Skip intro</button></header>
    <div class="opening-art"><div class="opening-image"></div><div class="opening-mist" aria-hidden="true"></div><div class="opening-lamp" aria-hidden="true"></div><p class="opening-loading" role="status">Loading illustration…</p><button type="button" class="opening-retry" hidden>Retry illustration</button></div>
    <section class="opening-caption" aria-live="polite" aria-atomic="true"><div class="opening-heading"><small data-opening-kicker></small><h1 id="opening-title"></h1></div><div id="opening-copy"><p></p><p></p></div><p class="opening-sound"></p></section>
    <footer class="opening-footer"><div class="opening-preference"><label><input type="checkbox"> Skip intro on future rounds</label><small>Replay it from the clubhouse menu.</small></div><nav aria-label="Story controls"><button type="button" data-opening="back">Back</button><span class="opening-count" aria-label="Slide"></span><button type="button" data-opening="next">Next →</button></nav></footer>
  </div>`;
  mount.append(dialog);
  dialog.querySelector('.opening-header span').lastChild.textContent=' '+header;
  dialog.querySelector('.opening-preference small').textContent=replayHint;
  const art=dialog.querySelector('.opening-image'),loading=dialog.querySelector('.opening-loading'),retry=dialog.querySelector('.opening-retry'),next=dialog.querySelector('[data-opening="next"]'),back=dialog.querySelector('[data-opening="back"]'),check=dialog.querySelector('input'),sound=dialog.querySelector('.opening-sound');
  const images=new Map();let index=0,token=0,ready=false,seen=Boolean(saved().seen),lastOutcome=null;
  function persist(){try{localStorage.setItem(storageKey,JSON.stringify({seen,skip:check.checked}));}catch{/* Private mode still permits a complete run. */}}
  function evict(){for(const [key]of images)if(key!==index&&key!==index+1)images.delete(key);}
  function load(i){
    if(!slides[i])return Promise.resolve(null);
    if(images.has(i))return images.get(i);
    const img=new Image();img.decoding='async';img.width=1672;img.height=941;img.alt=slides[i].alt;
    const promise=new Promise((resolve,reject)=>{
      img.onload=async()=>{try{await img.decode();resolve(img);}catch(e){reject(e);}};
      img.onerror=()=>reject(new Error('Illustration unavailable'));
      img.src=slides[i].src;
    });
    images.set(i,promise);return promise;
  }
  async function show(i){
    if(!dialog.open)return;index=Math.max(0,Math.min(slides.length-1,i));const generation=++token,slide=slides[index];
    if(document.activeElement===next||document.activeElement===back)dialog.focus({preventScroll:true});
    evict();ready=false;next.disabled=true;back.disabled=index===0;retry.hidden=true;loading.hidden=false;loading.textContent='Loading illustration…';
    dialog.dataset.loading='true';dialog.dataset.slide=String(index);art.replaceChildren();
    dialog.querySelector('[data-opening-kicker]').textContent=slide.kicker;
    dialog.querySelector('h1').textContent=slide.title;
    dialog.querySelectorAll('#opening-copy p').forEach((p,n)=>p.textContent=slide.lines[n]);
    dialog.querySelector('.opening-count').textContent=`${index+1} / ${slides.length}`;
    next.textContent=index===slides.length-1?finalLabel:'Next →';
    sound.textContent=`[${slide.sound}]`;sound.hidden=!captions();
    // Sound changes immediately, so the final engine stop precedes its reveal.
    onSlide(slide,index);
    try{
      const img=await load(index);if(generation!==token||!dialog.open)return;
      art.replaceChildren(img);dialog.dataset.loading='false';loading.hidden=true;ready=true;next.disabled=false;
      // One image ahead only, after the visible image finishes decoding.
      load(index+1).catch(()=>{});
    }catch{
      if(generation!==token||!dialog.open)return;
      loading.textContent='The illustration could not load. Retry, or continue with the story.';
      retry.hidden=false;next.disabled=false;
    }
  }
  function close(outcome){
    if(!dialog.open)return;lastOutcome=outcome;seen=true;persist();token++;dialog.close();
    art.replaceChildren();images.clear();ready=false;finish(outcome);
  }
  function action(name){
    if(!dialog.open)return;onGesture();
    if(name==='skip')close('skipped');
    else if(name==='back'&&index>0)show(index-1);
    else if(name==='next'&&!next.disabled){if(index===slides.length-1)close('completed');else show(index+1);}
  }
  for(const button of dialog.querySelectorAll('[data-opening]'))button.addEventListener('click',()=>action(button.dataset.opening));
  retry.onclick=()=>{images.delete(index);show(index);};check.onchange=persist;
  dialog.addEventListener('cancel',e=>{e.preventDefault();action('skip');});
  dialog.addEventListener('keydown',e=>{
    // Do not let the last Enter/Space also dismiss the following game guide.
    e.stopPropagation();if(e.repeat&&[...advanceKeys,'ArrowRight','ArrowLeft','Escape'].includes(e.code)){e.preventDefault();return;}
    if(e.code==='ArrowRight'){e.preventDefault();action('next');}
    else if(e.code==='ArrowLeft'){e.preventDefault();action('back');}
    else if(e.code==='Escape'){e.preventDefault();action('skip');}
    else if(e.code==='KeyF'){e.preventDefault();toggleFullscreen();}
    else if(advanceKeys.includes(e.code)&&(e.code==='KeyE'||!e.target.closest('button,input'))){e.preventDefault();action('next');}
  });
  document.addEventListener('visibilitychange',()=>{dialog.dataset.paused=String(document.hidden);});
  return {
    preloadFirst(){if(!images.size)load(0).catch(()=>{});},
    release(){if(!dialog.open)images.clear();},
    shouldSkip:()=>Boolean(saved().skip),
    open(){onGesture();check.checked=Boolean(saved().skip);dialog.dataset.reduced=String(reducedMotion()||matchMedia('(prefers-reduced-motion: reduce)').matches);dialog.dataset.paused=String(document.hidden);dialog.showModal();show(0);dialog.focus({preventScroll:true});},
    action,
    snapshot:()=>({active:dialog.open,slide:index+1,total:slides.length,title:slides[index].title,ready,manualAdvance:true,retainedImages:images.size,reducedMotion:dialog.dataset.reduced==='true',seen,lastOutcome,sound:slides[index].sound}),
  };
}
