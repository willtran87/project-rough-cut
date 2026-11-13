import {clamp,distance,wrap,SWALE} from './final-cut-course.js';
import {cabExitRoot} from './final-cut-cab.js';
import {createGroundFeet,advanceGroundFeet,restoreGroundFeet,groundSnapshot,groundHomes} from './final-cut-footwork.js';
import {cleanWheelFilm} from './final-cut-wheel-travel.js';

export const ROAD_EXIT={id:'road',x:0,y:104,label:'Leave the course · finish the final round'};
export const EXIT_START=7,EXIT_DURATION=6,EXIT_END=EXIT_START+EXIT_DURATION;
export function upgradeEndingMotion(saved){if(!saved||saved.motionVersion===2)return saved;const age=clamp(Number(saved.age)||0,0,300);return {...saved,motionVersion:2,age:Math.min(300,age<7?age:age<11?7+(age-7)/4*EXIT_DURATION:age+EXIT_DURATION-4)};}
const emit=(r,type,data={})=>{r.events.push({type,time:r.time,...data});if(r.events.length>24)r.events.shift();};
export function createEnding(saved={},wreck={x:9,y:74,yaw:-Math.PI/2}){
 const age=clamp(Number(saved.age)||0,0,300),secured=saved.secured===true;
 const joe={...cabExitRoot(wreck),height:0,phase:'cab',walk:0,speed:0,target:0,egress:wreck.yaw>0?0:2};
 const angle=v=>Number.isFinite(v)?wrap(v):0;
 return {age,secured,gate:secured?clamp(Number(saved.gate)||0,0,1):0,joe,wheelBase:angle(saved.wheelBase),wheelBases:Array.from({length:4},(_,k)=>angle(saved.wheelBases?.[k]??saved.wheelBase)),wheelFilm:cleanWheelFilm(saved.wheelFilm),reelBase:angle(saved.reelBase),applause:false,ruptured:age>=3.2,shutdown:age>=7};
}
export function wreckFromSave(saved){
 const w=saved?.wreck;
 return w&&Number.isFinite(w.x)&&Number.isFinite(w.y)&&Math.abs(w.x-SWALE.x)<SWALE.w/2&&Math.abs(w.y-SWALE.y)<SWALE.d/2?{x:w.x,y:w.y,yaw:Math.abs(w.yaw-Math.PI/2)<.01?Math.PI/2:-Math.PI/2}:{x:9,y:74,yaw:-Math.PI/2};
}
export function endingSnapshot(r){return r.won?{motionVersion:2,age:r.ending.age,secured:r.ending.secured,gate:r.ending.gate,wheelBase:r.ending.wheelBase,wheelBases:[...r.ending.wheelBases],wheelFilm:r.ending.wheelFilm.map(f=>({...f})),reelBase:r.ending.reelBase,joe:{...r.ending.joe,feet:groundSnapshot(r.ending.joe.feet)},wreck:{x:r.rig.x,y:r.rig.y,yaw:r.rig.yaw}}:undefined;}
export function collapsePose(age,reduced=false){
 const sink=clamp(age/5,0,1),strain=clamp((age-1.6)/2.4,0,1);
 return {sink:.72*sink,roll:.14*strain,wing:.28*strain,wheelSpin:age<7?(age*13-age*age*.75):54.25,reelSpin:age<6?age*8-age*age*2/3:24,rupture:age>=3.2,shutdown:age>=7,
  shudder:!reduced&&age<5?Math.sin(age*38)*.025*(1-sink):0};
}
// State owns all aftermath clocks. Joe follows fixed course-side waypoints,
// never acquires the player as a target and can never produce capture.
export function advanceEnding(r,dt){
 const e=r.ending,j=e.joe,oldYaw=j.yaw,oldSpeed=j.speed;e.age+=dt;j.speed=0;j.turnRate=0;j.acceleration=0;j.maxSpeed=1.45;
 if(!e.ruptured&&e.age>=3.2){e.ruptured=true;emit(r,'manifold-rupture',{x:17,y:74});}
 if(!e.shutdown&&e.age>=7){e.shutdown=true;emit(r,'rig-shutdown');}
 if(!e.applause&&e.age>=8){e.applause=true;emit(r,'last-applause');}
 if(!e.secured&&r.player.y>98.5){e.secured=true;r.saveSerial++;emit(r,'gate-closing');r.message='The gate closes behind you. You are on the public side.';r.messageTime=5;}
 if(e.secured&&e.gate<1){const before=e.gate;e.gate=clamp(e.gate+dt/.6,0,1);if(before<1&&e.gate===1){r.saveSerial++;emit(r,'gate-latched',{x:0,y:94});}}
 const start=cabExitRoot(r.rig);
 if(e.age<EXIT_START){j.phase='cab';return;}
 if(e.age<EXIT_END){j.phase='dismount';j.x=start.x;j.y=start.y;j.yaw=start.yaw;j.height=0;return;}
 if(j.phase==='cab'||j.phase==='dismount'){j.phase='walk';j.x=start.x;j.y=start.y;j.target=0;j.feet=createGroundFeet(j);j.atCorner=true;}
 // A frame straddling the last tread owns only its post-dismount fraction
 // of the ground turn. Using the whole frame snaps the actor on reload.
 const footDt=Math.min(dt,Math.max(0,e.age-EXIT_END));
 const path=[{x:18,y:82},{x:4,y:90},{x:0,y:92.8}];
 // Eastbound wrecks leave Joe south of the deployed wing. Walk behind the
 // power unit before heading north; a direct diagonal crosses the cutter.
 const egress=[{x:r.rig.x-3.3,y:start.y},{x:r.rig.x-3.3,y:82}],clearing=j.egress<2;
 if(j.target>=path.length){j.phase='fence';j.heading=0;j.yaw=wrap(j.yaw+clamp(wrap(-j.yaw),-footDt*1.8,footDt*1.8));j.turnRate=footDt>0?wrap(j.yaw-oldYaw)/footDt:0;advanceGroundFeet(j,footDt);return;}
 if(!clearing&&j.target===2&&!e.secured){j.phase='wait';advanceGroundFeet(j,footDt);return;}j.phase='walk';
 const target=clearing?egress[j.egress]:path[j.target],d=distance(j,target),heading=Math.atan2(target.x-j.x,target.y-j.y);
 j.heading=heading;
 j.yaw=wrap(j.yaw+clamp(wrap(heading-j.yaw),-footDt*1.8,footDt*1.8));
 // Finish the weight transfer at a corner before accelerating away. Otherwise
 // a short turn can restart the body while a trailing shoe is still catching up.
 if(j.atCorner){const homes=groundHomes(j);if(Math.abs(wrap(heading-j.yaw))<.02&&j.feet.every((f,i)=>!f.step&&Math.hypot(f.x-homes[i].x,f.y-homes[i].y)<.03&&Math.abs(wrap(f.yaw-j.yaw))<.1))j.atCorner=false;}
 const speed=Math.min(1.45,oldSpeed+3*footDt,Math.sqrt(6*d)),stride=Math.min(d,!j.atCorner&&Math.abs(wrap(heading-j.yaw))<.1?speed*footDt:0);j.x+=Math.sin(heading)*stride;j.y+=Math.cos(heading)*stride;j.speed=dt>0?stride/dt:0;j.walk+=stride;j.acceleration=footDt>0?(j.speed-oldSpeed)/footDt:0;
 j.distanceToStop=Math.max(0,d-stride);j.turnRate=footDt>0?wrap(j.yaw-oldYaw)/footDt:0;advanceGroundFeet(j,footDt);
 if(d<.025){if(clearing)j.egress++;else j.target++;j.atCorner=true;if(j.target===path.length){j.phase='fence';emit(r,'joe-at-fence');}}
}
export function restoreEnding(r,saved={}){
 // Reconstruct the deterministic actor path at the saved aftermath clock;
 // restoring never replays sounds, dialogue, gate movement or dangerous work.
 const age=clamp(Number(saved.age)||0,0,300),e=createEnding({wheelBase:saved.wheelBase,wheelBases:saved.wheelBases,wheelFilm:saved.wheelFilm,reelBase:saved.reelBase},r.rig);r.ending=e;e.secured=saved.secured===true;e.gate=e.secured?1:0;
 const events=r.events,serial=r.saveSerial,player=r.player;r.events=[];r.player={...player,y:85};
 for(let t=0;t<age;t+=1/60)advanceEnding(r,Math.min(1/60,age-t));
 r.events=events;r.saveSerial=serial;r.player=player;e.secured=saved.secured===true;e.gate=e.secured?1:0;
 const j=saved.joe;
 if(age>=EXIT_END&&j&&['walk','wait','fence'].includes(j.phase)&&['x','y','yaw','walk','target'].every(k=>Number.isFinite(j[k]))&&j.x>=-2&&j.x<=20&&j.y>=70&&j.y<=93&&j.target>=0&&j.target<=3){e.joe={x:j.x,y:j.y,yaw:wrap(j.yaw),walk:clamp(j.walk,0,100),target:j.target|0,phase:j.phase,height:0,speed:Array.isArray(j.feet)&&j.feet.length===2?clamp(Number(j.speed)||0,0,1.45):0,turnRate:clamp(Number(j.turnRate)||0,-1.8,1.8),atCorner:j.atCorner===true,egress:Number.isInteger(j.egress)?clamp(j.egress,0,2):2};e.joe.feet=restoreGroundFeet(j.feet,e.joe);}
 if(e.secured)Object.assign(r.player,{x:0,y:101,yaw:Math.PI});
}
