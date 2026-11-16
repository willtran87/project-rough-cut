// Short camera moves across the three hard cuts: dropping into the drain,
// the scythe landing and the sluice sealing. Presentation only. They read the
// run and a wall clock, never write either, and Reduced motion skips them all.
const SECONDS={start:.95,caught:.7,escape:1.05};
const ease=t=>1-(1-t)**3,clamp=t=>Math.max(0,Math.min(1,t));
export function createDrainTransitions(){
 let mode=null,owner=null,kind=null,started=0,moving=false;
 const progress=now=>kind?clamp((now-started)/1000/SECONDS[kind]):1;
 return {
  // Returns true while a move is running, so the caller keeps presenting
  // frames behind a panel that would otherwise draw once and rest.
  observe(run,now,reduced){
   if(run.mode!==mode||run!==owner){
    const previous=mode,fresh=run!==owner;mode=run.mode;owner=run;
    kind=reduced||previous===null?null:mode==='caught'&&previous==='playing'?'caught':mode==='complete'&&(previous==='playing'||previous==='aftermath')?'escape':mode==='playing'&&run.time<.05&&(fresh||previous!=='paused')?'start':null;
    started=now;
   }
   // An outcome keeps its final pose behind the panel; the entry move ends.
   moving=kind!==null&&progress(now)<1;if(kind==='start'&&!moving)kind=null;
   return moving;
  },
  // The outcome panel waits, unseen, for the capture or escape move to land.
  holding:()=>moving&&kind!=='start',
  kind:()=>kind,
  apply(camera,run,now,baseFov){
   if(!kind||run!==owner)return;
   const t=progress(now),p=run.player;
   if(kind==='start'){
    // Rise from a crouch at the foot of the entry and lift the eyes.
    const left=1-ease(t);camera.position.y-=.55*left;camera.rotation.x-=.38*left;camera.rotation.z+=.035*left;
   }else if(kind==='caught'){
    // A lurch at Joe: the view snaps round to him, is dragged in and buckles.
    const j=run.joe,dx=j.x-p.x,dz=-(j.y-p.y),reach=Math.hypot(dx,dz)||1,pull=ease(clamp(t*1.6)),drag=Math.min(.42*reach,Math.max(0,reach-.85))*pull;
    let turn=Math.atan2(-dx,-dz)-camera.rotation.y;turn=Math.atan2(Math.sin(turn),Math.cos(turn));
    camera.rotation.y+=turn*pull;camera.rotation.x+=(.1-camera.rotation.x)*pull;camera.rotation.z+=Math.sin(t*Math.PI)*.16-.07*t;
    camera.position.x+=dx/reach*drag;camera.position.z+=dz/reach*drag;camera.position.y-=.34*ease(clamp((t-.3)/.7));
   }else{
    // Relief: the view lifts and opens out as the sluice holds.
    const lift=ease(t);camera.position.y+=.38*lift;camera.rotation.x+=(.16-camera.rotation.x)*lift*.8;
    camera.fov=baseFov+10*lift;camera.updateProjectionMatrix();
   }
  },
 };
}
export const drainTransitions=createDrainTransitions();
