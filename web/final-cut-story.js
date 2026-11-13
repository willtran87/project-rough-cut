import {createDOMGamepadMenu} from './dom-gamepad-menu.js';

const storyArt={
 '01-final-review':'./assets/optimized/final-cut-story/01-final-review.webp',
 '02-joe-review':'./assets/optimized/final-cut-story/02-joe-review.webp',
 '03-load-limit':'./assets/optimized/final-cut-story/03-load-limit.webp',
 '04-caught':'./assets/optimized/final-cut-story/04-caught.webp',
 '05-ground-gives':'./assets/optimized/final-cut-story/05-ground-gives.webp',
 '06-public-road':'./assets/optimized/final-cut-story/06-public-road.webp',
};
const art=name=>storyArt[name];
export const FINAL_CUT_ART={splash:art('01-final-review'),loss:art('04-caught'),win:art('06-public-road')};
export const FINAL_CUT_STORIES={
 intro:[
  {id:'01-final-review',kicker:'CHAMPIONSHIP GROUNDS · THE EIGHTEENTH',title:'One final review',lines:['You made it through Joe’s pilot. Beyond this last hole, the public road is open.','The stands are empty. The floodlights are on. Joe has brought out the tournament machine.'],alt:'Joe waits in the open cab of an enormous industrial reel mower on the floodlit eighteenth fairway.'},
  {id:'02-joe-review',kicker:'JOE · COURSE CONTROL',title:'“We’re nearly finished.”',lines:['He says it with the same patient smile he used at your desk.','“One clean pass. Then we can close this out.” The cutting banks unfold across the grass.'],alt:'Joe gives a controlled half-smile from the mower cab, one hand on the wheel and the other at the hydraulic controls.'},
  {id:'03-load-limit',kicker:'THE COURSE HAS A FAULT',title:'Something he cannot force',lines:['A bypass feeds the low nursery swale. The old maintenance warning is simple: no heavy equipment on saturated turf.','Reach the pump. Flood the weak ground. The pavilion bell can bring Joe across it.'],alt:'Inside a stone pump shelter, a red bypass valve feeds the low wet swale beside a raised dry bank and a distant pavilion bell.'},
 ],
 win:[
  {id:'05-ground-gives',kicker:'THE WEIGHT OF THE MACHINE',title:'The ground gives first',lines:['The reels bite. The tires turn. The flooded turf takes the weight and will not give it back.','For the first time tonight, Joe has no instruction to offer.'],alt:'The industrial mower sinks into flooded turf. Joe grips the wheel with a shocked, disbelieving expression as water arcs past the cab.'},
  {id:'06-public-road',kicker:'OUTSIDE THE BOUNDARY',title:'Your shift is over',lines:['You reach the public road. Behind the fence, the machine is silent and Joe is finally out of reach.','At daybreak, the pilot is suspended and his course-control access is withdrawn. You hand in your badge.'],alt:'A discarded office badge lies on a safe public road. Beyond the closed fence, the mower is disabled in flooded turf and Joe stands far away.'},
 ],
};

// Illustrations stay in DOM, outside the WebGL scene. At most the current and
// next frame are decoded. Advancement is deliberate; narration never times out.
export function createFinalCutStory({root,reduced,onOpen,onClose,onGesture,fullscreen}){
 const key='rough-cut.final-cut-story.v1',read=()=>{try{return JSON.parse(localStorage.getItem(key))||{};}catch{return {};}};
 const dialog=document.createElement('dialog');dialog.id='final-cut-story';dialog.tabIndex=-1;dialog.setAttribute('aria-labelledby','fc-story-title');
 dialog.innerHTML=`<div class="fc-story-layout"><header><span>ROUGH CUT <i>/</i> <b data-story-kind></b></span><button data-story="skip">Skip scene</button></header><figure><div class="fc-story-image"></div><p class="fc-story-loading" role="status">Loading illustration…</p><button class="fc-story-retry" hidden>Retry illustration</button></figure><section class="fc-story-caption" aria-live="polite" aria-atomic="true"><small data-story-kicker></small><h2 id="fc-story-title"></h2><div class="fc-story-copy"><p></p><p></p></div></section><footer><label class="fc-story-preference"><input type="checkbox"> Skip opening on future rounds</label><span class="fc-story-ending-note">The road escape is saved.</span><nav aria-label="Cutscene controls"><button data-story="back">Back</button><span class="fc-story-count"></span><button data-story="next">Next →</button></nav></footer></div>`;
 root.append(dialog);
 const image=dialog.querySelector('.fc-story-image'),loading=dialog.querySelector('.fc-story-loading'),retry=dialog.querySelector('.fc-story-retry'),next=dialog.querySelector('[data-story=next]'),back=dialog.querySelector('[data-story=back]'),check=dialog.querySelector('input');
 let kind='intro',index=0,generation=0,ready=false,finish=null,lastOutcome=null;const images=new Map();
 const menu=createDOMGamepadMenu({root:dialog,onBack:()=>action('skip'),onStart:()=>action('next')});
 const slides=()=>FINAL_CUT_STORIES[kind];
 function load(i){if(!slides()[i])return Promise.resolve(null);if(images.has(i))return images.get(i);const img=new Image();img.alt=slides()[i].alt;img.decoding='async';const task=new Promise((resolve,reject)=>{img.onload=async()=>{try{await img.decode();resolve(img);}catch(e){reject(e);}};img.onerror=()=>reject(Error('Illustration unavailable'));img.src=art(slides()[i].id);});images.set(i,task);return task;}
 async function show(i){
  if(!dialog.open)return;index=Math.max(0,Math.min(slides().length-1,i));const token=++generation,s=slides()[index];ready=false;next.disabled=true;back.disabled=index===0;image.replaceChildren();loading.hidden=false;retry.hidden=true;loading.textContent='Loading illustration…';
  for(const n of images.keys())if(n!==index&&n!==index+1)images.delete(n);
  dialog.dataset.slide=String(index);dialog.dataset.loading='true';dialog.querySelector('[data-story-kicker]').textContent=s.kicker;dialog.querySelector('h2').textContent=s.title;dialog.querySelectorAll('.fc-story-copy p').forEach((p,n)=>p.textContent=s.lines[n]);dialog.querySelector('.fc-story-count').textContent=`${index+1} / ${slides().length}`;next.textContent=index===slides().length-1?(kind==='intro'?'Enter the grounds →':'View your ending →'):'Next →';
  dialog.focus({preventScroll:true});
  try{const img=await load(index);if(token!==generation||!dialog.open)return;image.replaceChildren(img);loading.hidden=true;dialog.dataset.loading='false';ready=true;next.disabled=false;load(index+1).catch(()=>{});}catch{if(token!==generation||!dialog.open)return;loading.textContent='Illustration unavailable. Retry, or continue with the story.';retry.hidden=false;next.disabled=false;}
 }
 function close(outcome='skipped',notify=true){if(!dialog.open)return;lastOutcome=outcome;generation++;dialog.close();image.replaceChildren();images.clear();ready=false;const callback=finish;finish=null;if(notify){onClose();callback?.();}}
 function action(name){if(!dialog.open)return;onGesture();if(name==='skip')close();else if(name==='back'&&index>0)show(index-1);else if(name==='next'&&!next.disabled){if(index===slides().length-1)close('completed');else show(index+1);}}
 for(const b of dialog.querySelectorAll('[data-story]'))b.onclick=()=>action(b.dataset.story);
 retry.onclick=()=>{images.delete(index);show(index);};check.onchange=()=>{try{localStorage.setItem(key,JSON.stringify({...read(),skipIntro:check.checked}));}catch{}};
 dialog.addEventListener('cancel',e=>{e.preventDefault();action('skip');});
 dialog.addEventListener('keydown',e=>{e.stopPropagation();if(e.repeat&&['Enter','Space','ArrowLeft','ArrowRight','Escape'].includes(e.code)){e.preventDefault();return;}if(e.code==='ArrowRight'){e.preventDefault();action('next');}else if(e.code==='ArrowLeft'){e.preventDefault();action('back');}else if(e.code==='Escape'){e.preventDefault();action('skip');}else if(e.code==='KeyF'){e.preventDefault();fullscreen();}else if(['Enter','Space'].includes(e.code)&&!e.target.closest('button,input')){e.preventDefault();action('next');}});
 document.addEventListener('visibilitychange',()=>dialog.dataset.paused=String(document.hidden));
 return {get active(){return dialog.open;},shouldSkip:()=>Boolean(read().skipIntro),open(name,done){if(dialog.open)return;kind=name;finish=done;images.clear();check.checked=Boolean(read().skipIntro);dialog.querySelector('.fc-story-preference').hidden=kind!=='intro';dialog.querySelector('.fc-story-ending-note').hidden=kind!=='win';dialog.querySelector('[data-story-kind]').textContent=kind==='intro'?'THE FINAL CUT':'BEYOND THE BOUNDARY';dialog.dataset.reduced=String(reduced()||matchMedia('(prefers-reduced-motion:reduce)').matches);dialog.dataset.paused=String(document.hidden);onOpen();dialog.showModal();show(0);},action,close,updatePad:(pad,dt)=>menu.update(pad,dialog.open,dt),snapshot:()=>({active:dialog.open,kind,slide:index+1,total:slides().length,title:slides()[index].title,ready,manualAdvance:true,retainedImages:images.size,lastOutcome,reducedMotion:dialog.dataset.reduced==='true'})};
}
