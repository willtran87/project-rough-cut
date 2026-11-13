import {audibleSource} from './under-green-senses.js';

// A real floor material in the shared service passage, not an AI-state cue.
export const SERVICE_GRATE=Object.freeze({x:-7,y:40,w:5,d:3.6});
export function onServiceGrate(p){const g=SERVICE_GRATE;return Math.abs(p.x-g.x)<=g.w/2&&Math.abs(p.y-g.y)<=g.d/2;}
export function footSurface(p){return onServiceGrate(p)?'metal':'stone';}

// Consume presented sole contacts independently of AudioContext/mute. A retry,
// time discontinuity or paused render must never manufacture a landing.
export function createGratingCue(){
 let owner=null,lastTime=null,last=null,seen=new WeakSet();
 return {
  update(run,events){
   if(owner!==run||lastTime!==null&&run.time<lastTime){owner=run;last=null;seen=new WeakSet();}
   lastTime=run.time;
   for(const event of events){
    if(seen.has(event))continue;seen.add(event);
    if(event.owner!==run||event.time!==run.time||run.mode!=='playing'||!onServiceGrate(event))continue;
    if(audibleSource(run,event,{range:36,sourceHeight:.12}).gain<=.05)continue;
    last={x:event.x,y:event.y,time:event.time,serial:event.serial};
   }
  },
  caption(run){
   if(owner!==run||run.mode!=='playing'||!last||run.time<last.time||run.time-last.time>1.15)return '';
   const source=audibleSource(run,last,{range:36,sourceHeight:.12});if(source.gain<=.05)return '';
   const side=Math.abs(source.pan)>=.4?(source.pan<0?' to your left':' to your right'):'';
   return `[Boots ring on metal${side}]`;
  },
  stats:()=>last?{...last}:null
 };
}

export function buildServiceGrate(box){
 const g=SERVICE_GRATE;
 // Flush plates sit above the floor by less than 2mm, below the existing sole
 // tolerance. All bars share the existing static material batches.
 box('rubber',g.x,.0003,-g.y,g.w,.0006,g.d);
 for(const side of [-1,1]){
  box('iron',g.x+side*(g.w/2-.04),.0013,-g.y,.08,.001,g.d);
  box('iron',g.x,.0013,-g.y+side*(g.d/2-.04),g.w,.001,.08);
 }
 for(let i=1;i<25;i++)box('steel',g.x-g.w/2+i*g.w/25,.001,-g.y,.035,.001,g.d-.16);
 for(const offset of [-1,0,1])box('iron',g.x,.0013,-g.y+offset,g.w-.16,.001,.045);
}
