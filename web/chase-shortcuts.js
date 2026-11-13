import {chaseActor} from './chase-player.js';
import {COURSE} from './back-nine-course.js';
import {barrierHalfWidth,barrierFootprint} from './chase-barriers.js';
import {hullOverlap,constrainVehicleMotion} from './vehicle-contact.js';
import {emitCourseCue} from './back-nine-course-fx.js';

export const GATE_UNLATCH_SECONDS=1.1,GATE_SWING_SECONDS=.8;
const gateShape={};

// Gates open away from the operator. Test the swept leaf against both actors;
// an obstructed hinge waits rather than pushing anyone through a post or wall.
function swingGate(run,gate,state,dt){
 if(!state.unlatched||state.open>=1)return;
 const start=state.open,target=Math.min(1,start+dt/GATE_SWING_SECONDS),steps=Math.max(1,Math.ceil((target-start)*100));
 state.swingBlocked=false;
 for(let n=1;n<=steps;n++){
  state.open=start+(target-start)*n/steps;barrierFootprint(gate,state,gateShape);
  if(hullOverlap(chaseActor(run),run.foot?'foot':'cart',gateShape,'feature')||hullOverlap(run.joe,'mower',gateShape,'feature')){
   state.open=start+(target-start)*(n-1)/steps;state.swingBlocked=true;break;
  }
 }
}

// Only Joe can smash timber. Player hulls stop at intact rails; backing
// away is always available, and broken gates remain open for this attempt.
export function updateShortcuts(run,input,dt,from){
 if(run.mode!=='driving')return;
 const c=chaseActor(run),f=run.courseFX;f.gateNear=-1;
 for(let i=0;i<COURSE.hurdles.length;i++){
  const gate=COURSE.hurdles[i];
  const state=run.courseFX.breaks[i];if(state.age>=0)continue;
  const yaw=gate.yaw||0,sin=Math.sin(yaw),cos=Math.cos(yaw),local=p=>({along:(p.x-gate.x)*sin+(p.y-gate.y)*cos,across:(p.x-gate.x)*cos-(p.y-gate.y)*sin});
  const before=local(from),after=local(c),angle=c.yaw-yaw,reach=(run.foot?.32:1.6)*Math.abs(Math.cos(angle))+(run.foot?.32:1.16)*Math.abs(Math.sin(angle)),width=(run.foot?.32:1.16)*Math.abs(Math.cos(angle))+(run.foot?.32:1.6)*Math.abs(Math.sin(angle));
  if(gate.shortcut!==undefined){
   const near=Math.abs(after.across)<1.35&&Math.abs(after.along)<4.4;
   if(near&&state.open<1)f.gateNear=i;
   if(!state.unlatched){
    state.press=near&&input.brake&&Math.abs(c.speed)<.7?Math.min(GATE_UNLATCH_SECONDS,state.press+dt):0;
    if(state.press>=GATE_UNLATCH_SECONDS){
     state.unlatched=true;state.swingDirection=after.along<0?-1:1;
     run.events.push({type:'gate-unlatched',index:gate.shortcut,time:run.time});
     emitCourseCue(f,'gate',gate,.45);
    }
   }
   swingGate(run,gate,state,dt);
   barrierFootprint(gate,state,gateShape);
   const kind=run.foot?'foot':'cart',initial=hullOverlap(from,kind,gateShape,'feature'),end=hullOverlap(c,kind,gateShape,'feature');
   // A shove can begin inside the thin leaf. Always permit a move that
   // reduces that overlap; otherwise sweep the entire attempted motion.
   if(!initial||end&&end.depth>=initial.depth-1e-7)constrainVehicleMotion(c,from,gateShape,kind,'feature');
   continue;
  }
  if(Math.min(Math.abs(before.across),Math.abs(after.across))>barrierHalfWidth(gate)+width||Math.min(before.along,after.along)>reach+.12||Math.max(before.along,after.along)<-reach-.12){state.press=0;continue;}
  // Moving away from a closed gate must always be possible.
  if(Math.abs(after.along)>Math.abs(before.along)+.0001){state.press=0;continue;}
  state.press=0;Object.assign(c,{x:from.x,y:from.y,yaw:from.yaw,speed:0});
  if(run.messageTime<=0){run.message='Timber blocks this cut. Go around, or lure Joe through it.';run.messageTime=2;}
 }
}
export function shortcutCaption(run){
 if(run.mode!=='driving'||!(run.courseFX?.gateNear>=0))return '';
 const state=run.courseFX.breaks[run.courseFX.gateNear];if(state.age>=0||state.open>=1)return '';
 if(state.unlatched)return state.swingBlocked?'GATE BLOCKED · back clear of the swinging timber.':'GATE UNLATCHED · move through when clear.';
 if(state.press>0)return `Hold Use · unlatching ${Math.floor(state.press/GATE_UNLATCH_SECONDS*100)}% · Joe keeps moving`;
 return 'Stop and hold Use to unlatch the narrow cut · Joe keeps moving.';
}
