import {searchProbeSide} from './chase-variation.js';
import {blocked,clamp,distance} from './back-nine-course.js';

export const SEARCH_SECONDS=10;
export function createSenses(){return {visible:false,heard:false,source:'none',observation:null,nextHearingAt:0,serial:0,phase:'none',age:0,deadline:0,points:[],cursor:0,hold:0,searches:0};}
function remember(run,point,source,yaw=0,speed=0){
 const j=run.joe,s=j.senses||(j.senses=createSenses());
 s.observation??={x:0,y:0,yaw:0,speed:0};const o=s.observation;o.x=point.x;o.y=point.y;o.yaw=yaw;o.speed=speed;s.source=source;s.serial++;
 j.lastSeen??={x:0,y:0};j.lastSeen.x=point.x;j.lastSeen.y=point.y;j.seenAge=0;
 if(s.phase!=='none'){s.phase='none';s.points=[];s.cursor=0;j.repath=0;}
}
export function hearAlarm(run,point){remember(run,point,'alarm');}

// Sight gives a continuous observation. Sound supplies a coarse location at
// a bounded cadence, never the hidden player's heading or per-frame steering.
export function updateSenses(run,dt,visible,heard){
 const j=run.joe,c=run.foot||run.cart,s=j.senses||(j.senses=createSenses());
 // Accept an existing legacy/test memory without refreshing its age.
 if(!s.observation&&j.lastSeen&&j.seenAge<SEARCH_SECONDS){s.observation={...j.lastSeen,yaw:j.yaw,speed:0};s.source='memory';}
 s.visible=visible;s.heard=heard;j.seenAge+=dt;
 if(visible){remember(run,c,'sight',c.yaw,c.speed);s.nextHearingAt=run.time+.7;}
 else if(heard&&run.time>=s.nextHearingAt){
  const grid=run.foot?4:6,point={x:Math.round(c.x/grid)*grid,y:Math.round(c.y/grid)*grid};
  remember(run,point,'sound',Math.atan2(point.x-j.x,point.y-j.y));s.nextHearingAt=run.time+(run.foot?1:.75);
 }
 if(visible){j.mode='pursuit';return;}
 if(heard){j.mode='investigate';return;}
 j.mode=j.seenAge<SEARCH_SECONDS&&s.observation&&s.phase!=='depart'?'search':'patrol';
}

// Called after the encounter owners have selected their actions. Search is
// subordinate to physical attacks, recovery, alarms and announced detours.
// Each search has one last-known point and at most two fixed nearby probes.
export function updateSearch(run,dt){
 const j=run.joe,s=j.senses,c=run.foot||run.cart;
 if(!s||s.visible||s.heard||!s.observation)return;
 if(j.seenAge>=SEARCH_SECONDS){j.mode='patrol';if(s.phase!=='depart'){s.phase='depart';s.points=[];j.repath=0;}return;}
 if(run.grace>0||c.invulnerable>0||run.mode!=='driving'||(run.decoys.active>=0||run.utility?.active>=0||run.tactics?.active>=0)||j.ram.phase!=='none'||j.ram.footCharge>0||run.hunt.phase!=='follow')return;
 if(s.phase==='none'){
  const o=s.observation,side=searchProbeSide(run,o,s.searches);s.searches++;s.phase='approach';s.age=0;s.hold=0;s.cursor=0;s.deadline=run.time+SEARCH_SECONDS-j.seenAge;s.points=[{x:o.x,y:o.y}];
  for(const sign of [side,-side]){
   for(const radius of [9,6]){const a=o.yaw+sign*1.05,p={x:o.x+Math.sin(a)*radius,y:o.y+Math.cos(a)*radius};if(!blocked(p,2.7)&&(!run.foot||distance(p,run.cart)>5)){s.points.push(p);break;}}
  }
  j.repath=0;run.events.push({type:'search',source:s.source,time:run.time});
 }
 if(s.phase==='depart')return;
 s.age+=dt;const target=s.points[s.cursor];
 if(s.phase==='listen'){
  s.hold-=dt;if(s.hold<=0){s.cursor++;s.age=0;s.phase=s.cursor<s.points.length?'sweep':'depart';j.repath=0;}return;
 }
 if(target&&(distance(j,target)<3||s.age>(s.cursor===0?4.5:2.5))){s.phase='listen';s.hold=.65;s.age=0;j.repath=0;}
}
export function searchTarget(run){const s=run.joe.senses;return s&&!s.visible&&!s.heard&&['approach','listen','sweep'].includes(s.phase)?s.points[s.cursor]:null;}
export function searchSpeedLimit(run){
 const j=run.joe,s=j.senses;if(!searchTarget(run))return Infinity;
 if(s.phase==='listen')return 0;
 return Math.min(run.foot?5.8:7,clamp(distance(j,s.points[s.cursor])*1.5,0,7));
}
