import {BASINS,VALVES,BASIN_TIMING as T,BREAKER,BLACKOUT} from './final-cut-basin-layout.js';

const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export const basinById=id=>BASINS.find(b=>b.id===id);
export const SWALE_BASIN=basinById('swale');
// Only which hollows are used up is remembered. Standing water never survives
// a retry or a reload: every attempt starts with dry ground.
export function createBasins(saved,won=false){
 const spent=Array.isArray(saved?.spent)?saved.spent.filter(id=>BASINS.some(b=>b.id===id&&!b.final)).slice(0,2):[];
 return Object.fromEntries(BASINS.map(b=>[b.id,b.final&&won?{state:'full',level:1,age:0}:{state:spent.includes(b.id)?'spent':'dry',level:spent.includes(b.id)?T.wetAt:0,age:0}]));
}
export const basinSnapshot=r=>({spent:BASINS.filter(b=>r.basins[b.id].state==='spent').map(b=>b.id)});
/** How many times the machine has been held: 0, 1 or 2 before the last. */
export const stageOf=r=>Math.min(2,BASINS.filter(b=>r.basins[b.id].state==='spent').length);
export const flowing=r=>BASINS.find(b=>['filling','full'].includes(r.basins[b.id].state))||null;
export const swaleArmed=r=>['filling','full'].includes(r.basins.swale.state);
export function valveState(r,b){
 const s=r.basins[b.id];
 if(!r.pump)return {ok:false,label:'Valve · the pump is not primed',note:'No pressure. Prime the pump in the pump shelter first.'};
 if(s.state==='spent')return {ok:false,label:'Valve · this line has burst',note:'This hollow is churned to mud. It will not hold water again.'};
 if(b.final&&stageOf(r)<2)return {ok:false,label:'Nursery valve · not enough pressure',note:'The fairway lines still draw the pressure. Hold him twice in the hollows first.'};
 if(s.state==='filling'||s.state==='full')return {ok:false,label:`Valve open · the ${b.name} is ${s.state==='full'?'full':'filling'}`,note:`The ${b.name} is already ${s.state==='full'?'full':'filling'}.`};
 return {ok:true,label:`Open the valve · flood the ${b.name}`,note:''};
}
/** Sends all pressure to one basin. Any other standing water starts to drain. */
export function openValve(r,b){
 for(const other of BASINS){const s=r.basins[other.id];if(other!==b&&['filling','full'].includes(s.state)){s.state='draining';s.age=0;}}
 const s=r.basins[b.id];s.state='filling';s.age=0;
 // A valve wheel squeals. He can hear it as he hears running feet.
 r.lastNoise={x:b.valve.x,y:b.valve.y,time:r.time,source:'valve'};
}
export function advanceBasins(r,dt,event){
 let gauge=0;
 for(const b of BASINS){
  const s=r.basins[b.id];
  if(b.final&&r.won){s.state='full';s.level=1;}
  else if(s.state==='filling'){s.level=clamp(s.level+dt/T.fill);if(s.level>=1){s.state='full';s.age=0;event(r,'basin-full',{id:b.id});}}
  else if(s.state==='full'){s.age+=dt;if(s.age>=(b.final?T.swaleHold:T.hold)){s.state='draining';s.age=0;event(r,'basin-draining',{id:b.id});}}
  else if(s.state==='draining'){s.level=clamp(s.level-dt/T.drain);if(s.level<=0){s.state='dry';event(r,'basin-dry',{id:b.id});}}
  else if(s.state==='spent')s.level=Math.max(T.wetAt,s.level-dt/20);
  if(s.state==='filling'||s.state==='full')gauge=Math.max(gauge,s.level);
 }
 // Existing readers (wet footing, wheel film, the swale's own art) keep
 // reading one number: the nursery swale's level.
 r.water=r.basins.swale.level;r.gauge=gauge;
}
/** Seconds of standing water left in a full basin, for prompts and the HUD. */
export function holdRemaining(r,b){const s=r.basins[b.id];return s.state==='full'?Math.max(0,(b.final?T.swaleHold:T.hold)-s.age):0;}
/** The basin under the machine's centre on its committed strip, if any. */
export function basinUnder(r){
 const j=r.rig;
 for(const b of BASINS){
  const s=r.basins[b.id];
  if(b.final){if(Math.abs(j.x-b.x)<b.w/2-1.5&&Math.abs(j.y-b.y)<b.d/2-1.5)return {basin:b,level:s.level,state:s.state};continue;}
  if(j.attack?.axis==='y'||Math.abs(j.y-b.y)>.5||Math.abs(j.x-b.x)>=b.w/2-1)continue;
  return {basin:b,level:s.level,state:s.state};
 }
 return null;
}
export const valveActions=r=>VALVES.map(v=>{const b=basinById(v.basin);return {...v,label:valveState(r,b).label};});
// Floodlights. While they are down he sees only what is close.
export function createBlackout(){return {until:0,ready:0,from:0};}
export function throwBreaker(r){
 r.blackout={from:r.time,until:r.time+BLACKOUT.seconds,ready:r.time+BLACKOUT.cooldown};
 r.lastNoise={x:BREAKER.x,y:BREAKER.y,time:r.time,source:'breaker'};
}
export const breakerReady=r=>r.time>=(r.blackout?.ready||0);
export const blackedOut=r=>!!r.blackout&&r.blackout.until>0&&r.time<r.blackout.until;
/** 0 with the banks lit, 1 with them down; eased at both ends. */
export function lightsDown(r){
 const b=r.blackout;if(!b||!b.until||r.time<b.from)return 0;
 const left=b.until-r.time;if(left<=-BLACKOUT.restore)return 0;
 return clamp((r.time-b.from)/BLACKOUT.fade)*(left>=0?1:1+left/BLACKOUT.restore);
}
