import {WATERS,waterState,inWater} from './under-green-course.js';
import {floodState} from './under-green-flood.js';
import {waterContactHeight} from './under-green-water-contacts.js';

// Presentation history only. Current immersion shares the actual channel,
// puddle and whole-level flood surfaces used by splashes and ripples.
export function createActorWetness(){
 let owner=null,lastTime=0,arms=0,feet=[];
 const reset=r=>{owner=r;lastTime=r.time;arms=0;feet=Array.from({length:2},()=>({current:-1,top:0,fade:0,mudTop:.13}));};
 return {
  update(r,contacts=[]){
   const fresh=owner!==r||r.time<lastTime;if(fresh)reset(r);
   const dt=Math.max(0,r.time-lastTime);lastTime=r.time;
   if(!fresh&&dt===0)return;
   if(!['playing','aftermath'].includes(r.mode)||r.joe.phase==='absent')return;
   const states=WATERS.map(w=>waterState(w,r.time,r.bypass,r.bypassAt)),flood=floodState(r.elapsed||0).depth;
   feet.forEach((foot,i)=>{
    foot.fade=Math.max(0,foot.fade-dt/45);const p=contacts[i],height=p?waterContactHeight(p,WATERS,states,flood):null;
    foot.current=height!==null&&p.height<height+.02?height:-1;
    if(foot.current>=0){
     // Shallow water refreshes the sole without indefinitely refreshing an
     // older, much higher soaked trouser leg.
     if(foot.current>=foot.top-.03||foot.fade<.04){foot.top=foot.current+.025;foot.fade=1;}
     foot.mudTop=Math.max(foot.mudTop,Math.min(.45,foot.current+.025));
    }
   });
   arms=Math.max(0,arms-dt/30);
   if(r.joe.phase==='water-recovery'&&WATERS.some((w,i)=>states[i].danger&&inWater(r.joe,w,.6)))arms=1;
  },
  stats:()=>({feet:feet.map(f=>({...f})),arms}),
 };
}
