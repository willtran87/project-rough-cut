import {COURSE,distance,blocked} from './back-nine-course.js';
import {featurePose} from './course-destruction-state.js';
import {hullOverlap,constrainVehicleMotion} from './vehicle-contact.js';
import {emitCourseCue} from './back-nine-course-fx.js';

export const TACTIC_STATIONS=[
 {id:'west-flush',kind:'water',x:-10,y:220,zone:0,label:'Flood the pump approach'},
 {id:'range-cart',kind:'cart',x:24,y:449,feature:'range-abandoned-cart',label:'Release the empty cart'},
 {id:'east-flush',kind:'water',x:30,y:480,zone:1,label:'Flood the range approach'}
];
export const TACTIC_HOLD=.9;
export function createTactics(){return {near:-1,hold:0,used:0,brokenAt:[null,null,null],active:-1,until:0,started:0,floodUntil:[0,0,0],result:'',serial:0,cartTravel:0};}
export function constrainTacticControls(run,actor,from,kind){
 const s=run.tactics;if(!s)return false;let hit=false;
 for(const [i,station]of TACTIC_STATIONS.entries()){
  if(s.brokenAt[i]!==null)continue;
  const solid={x:station.x+2.6,y:station.y,rx:.42,ry:.22},probe={...actor};
  if(!constrainVehicleMotion(probe,from,solid,kind,'feature'))continue;
  if(kind==='mower'&&Math.abs(actor.speed)>.4){s.brokenAt[i]=run.time;emitCourseCue(run.courseFX,'metal',solid,.5);run.events.push({type:'joe-destruction',id:station.id+'-control',time:run.time});}
  else{Object.assign(actor,probe);hit=true;}
 }
 return hit;
}
export function updateTactics(run,input,dt,visible){
 const s=run.tactics;if(!s||run.mode!=='driving')return;
 const c=run.foot||run.cart,j=run.joe;s.near=-1;
 const cart=COURSE.features.find(f=>f.id==='range-abandoned-cart'),state=run.destruction.features[cart.id];
 // The released cart rolls down the shoulder. It stops at solid scenery or
 // the player, and Joe can crush it at its actual current position.
 if(s.cartTravel>0&&state.brokenAt===null&&s.cartTravel<18){
  const p=featurePose(run,cart),speed=3.6*(1-s.cartTravel/22),step=Math.min(speed*dt,18-s.cartTravel),next={...p,y:p.y+step};
  const occupied=blocked(next,1.5)||hullOverlap(c,run.foot?'foot':'cart',next,'feature')||COURSE.features.some(f=>f!==cart&&run.destruction.features[f.id]?.brokenAt==null&&Math.abs(f.x-next.x)<f.rx+next.rx&&Math.abs(f.y-next.y)<f.ry+next.ry);
  if(!occupied){state.x=next.x;state.y=next.y;s.cartTravel+=step;}else s.cartTravel=18;
 }
 if(s.active>=0){
  if(run.time>=s.until||state.brokenAt!==null){s.active=-1;j.repath=0;s.result='spent';}
  else if(run.time-s.started>1.2&&(visible||j.senses.heard)){
   s.active=-1;j.repath=0;s.result='spotted';run.message='Distraction lost · Joe spotted you. Find cover.';run.messageTime=2;
  }
 }
 for(let i=0;i<TACTIC_STATIONS.length;i++){
  const station=TACTIC_STATIONS[i];if(s.used&(1<<i)||s.brokenAt[i]!==null||station.kind==='cart'&&state.brokenAt!==null)continue;
  if(distance(c,station)<4.5){s.near=i;break;}
 }
 if(s.near<0||!input.brake||Math.abs(c.speed)>.7||distance(c,j)<6){s.hold=0;return;}
 s.hold+=dt;if(s.hold<TACTIC_HOLD)return;
 const i=s.near,station=TACTIC_STATIONS[i];s.used|=1<<i;s.hold=0;s.serial++;s.started=run.time;
 if(station.kind==='water'){
  s.floodUntil[station.zone]=run.time+14;s.result='flooded';
  run.message='Pressure released · flooded turf will bog Joe down. Take the dry edge.';
  emitCourseCue(run.courseFX,'gate',station,.7);
 }else{
  state.x=cart.x;state.y=cart.y+.01;s.cartTravel=.01;s.active=i;s.until=run.time+8;s.result='rolling';j.repath=0;
  run.message='Empty cart released · break sight while Joe follows the noise.';
  emitCourseCue(run.courseFX,'metal',cart,.7);
 }
 run.messageTime=3;run.events.push({type:'course-tactic',id:station.id,time:run.time});
}
export function tacticTarget(run){const s=run.tactics;return s?.active>=0?featurePose(run,COURSE.features.find(f=>f.id==='range-abandoned-cart')):null;}
export function tacticSpeedLimit(run){
 const j=run.joe,s=run.tactics;
 return s&&COURSE.wet.some((w,i)=>s.floodUntil[i]>run.time&&distance(j,w)<w.r)?(run.foot?4.8:7):Infinity;
}
export function tacticCaption(run){
 const s=run.tactics;if(!s||s.near<0)return '';
 const label=TACTIC_STATIONS[s.near].label;
 return Math.abs((run.foot||run.cart).speed)>.7?`Stop here · ${label.toLowerCase()}`:`Hold Use · ${label}${s.hold>0?' '+Math.floor(s.hold/TACTIC_HOLD*100)+'%':''} · single use`;
}

export const EXIT_RELEASE={x:-23,y:795.5},EXIT_RELEASE_SECONDS=1.3,EXIT_CLEARANCE=.56;
export function createExitRelease(){return {hold:0,released:false,open:0,near:false};}
export function updateExitRelease(run,input,dt,from){
 const s=run.exitRelease,c=run.foot||run.cart;if(!s||run.mode!=='driving')return;
 s.near=distance(c,EXIT_RELEASE)<4.5;
 if(!s.released){
  s.hold=run.checkpoint===2&&s.near&&input.brake&&Math.abs(c.speed)<.7?s.hold+dt:0;
  if(s.hold>=EXIT_RELEASE_SECONDS){s.released=true;run.message='Shutter freed · get inside and hold Use to lock it!';run.messageTime=4;emitCourseCue(run.courseFX,'metal',EXIT_RELEASE,.8);run.events.push({type:'exit-released',time:run.time});}
 }
 if(s.released)s.open=Math.min(1,s.open+dt/1.15);
 if(s.open<EXIT_CLEARANCE){
  const barrier={x:-23,y:800,rx:5.5,ry:.15};
  // A release never pushes the actor through the shutter. Reverse remains
  // available while the motor lifts it to a full cart-height opening.
  if(!hullOverlap(from,run.foot?'foot':'cart',barrier,'feature')||Math.abs(c.y-800)<Math.abs(from.y-800))constrainVehicleMotion(c,from,barrier,run.foot?'foot':'cart','feature');
 }
}
export function exitCaption(run){const s=run.exitRelease;if(!s||run.checkpoint<2||(run.foot||run.cart).y<765)return '';
 if(!s.released)return s.near?`Hold Use · free the jammed shutter${s.hold?' '+Math.floor(s.hold/EXIT_RELEASE_SECONDS*100)+'%':''}`:'GARAGE AHEAD · stop at the shutter release';
 return s.open<EXIT_CLEARANCE?'Shutter lifting · move through as it clears':'Shutter open · get fully inside and hold Use';
}
