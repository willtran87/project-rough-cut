import {WALLS,FIXTURES,LANES,clamp,wrap,refuge,lineClear,concealed,segmentBox} from './final-cut-course.js';
import {rigWallHit} from './final-cut-rig.js';
import {AMBUSH_CORRIDOR_X} from './final-cut-route-layout.js';
import {advanceRollingTravel} from './final-cut-travel.js';

export const AMBUSH={travelSpeed:18,travelAcceleration:12,cutSpeed:10.2,cutAcceleration:8.5,warning:1.05,lateWarning:.9,lift:.4};
// Reeds screen the service roads and the ends of the clear eastern corridor.
// These are fixed world locations, never grass spawned around the camera.
export const AMBUSH_REEDS=[
 {id:'west',x:-27.8,y:56,w:3.2,d:76,h:5.5},
 {id:'east',x:27.8,y:58,w:3.2,d:72,h:5.5},
 {id:'south',x:AMBUSH_CORRIDOR_X,y:33,w:11.5,d:3.4,h:5.3},
 {id:'north',x:AMBUSH_CORRIDOR_X,y:83.5,w:11.5,d:3.4,h:5.3},
 // Screen the far service connection, leaving the public-road opening clear.
 {id:'north-road-west',x:-23.5,y:96.8,w:41,d:2.6,h:5.2},
 {id:'north-road-east',x:23.5,y:96.8,w:41,d:2.6,h:5.2},
];
export function attackWarning(r){return r.pump?AMBUSH.lateWarning:AMBUSH.warning;}
export function ambushTell(r){
 const j=r.rig,a=j.attack;if(!a||j.phase!=='announce'||r.won)return null;
 const reed=AMBUSH_REEDS.find(p=>p.id===a.entry);
 return {entry:a.entry,x:reed.x,y:a.axis==='y'?reed.y:a.from.y,age:j.age,duration:attackWarning(r),strength:.45+.55*Math.sin(Math.min(1,j.age/attackWarning(r))*Math.PI/2)};
}
export function heardPlayer(r){const n=r.lastNoise;return n&&r.time-n.time<9?n:null;}
export const reedsOcclude=(a,b)=>AMBUSH_REEDS.some(p=>segmentBox(a,b,p));
export function seesPlayer(r){return !concealed(r)&&lineClear(r.rig,r.player)&&!reedsOcclude(r.rig,r.player)&&Math.hypot(r.rig.x-r.player.x,r.rig.y-r.player.y)<90;}
export function observedPlayer(r){return r.lastSight&&r.time-r.lastSight.time<8?r.lastSight:null;}
export function rememberNoise(r){
 if(r.player.speed>5&&!refuge(r.player))r.lastNoise={x:r.player.x,y:r.player.y,time:r.time};
 if(seesPlayer(r))r.lastSight={x:r.player.x,y:r.player.y,time:r.time};
}
function clearAttack(a){
 const length=Math.hypot(a.to.x-a.from.x,a.to.y-a.from.y),yaw=Math.atan2(a.to.x-a.from.x,a.to.y-a.from.y);
 for(let d=0;d<=length;d+=.4){const t=d/length;if(rigWallHit({x:a.from.x+(a.to.x-a.from.x)*t,y:a.from.y+(a.to.y-a.from.y)*t,yaw,deployment:1,phase:'pass',steering:0},[...WALLS,...FIXTURES]))return false;}
 return true;
}
export function planAmbush(r,lane,source,trap,stripOnly=false){
 const j=r.rig,target=j.seen?r.player:source==='observed player'?observedPlayer(r):heardPlayer(r),east={entry:'east',from:{x:30,y:LANES[lane]},to:{x:-30,y:LANES[lane]}};
 const west={entry:'west',from: east.to,to:east.from};
 // The first demonstration and deliberate lure retain their authored strip.
 // Subsequent attacks alternate their approach without reading hidden motion.
 let entry=j.x<0?'west':'east';
 if(j.x>0&&target&&target.x>AMBUSH_CORRIDOR_X-5.25&&target.y>31&&target.y<85&&source!=='golf ball')entry=j.passSerial%2?'north':'south';
 else if(j.x>0&&j.passSerial%4===2&&source==='mowing schedule')entry='north';
 else if(j.x>0&&j.passSerial%4===0&&source==='mowing schedule')entry='south';
 // Use the nearby end of the eastern corridor instead of driving its full
 // length just to alternate. Mid-course departures retain the variation.
 if(entry==='north'||entry==='south'){if(j.y<43)entry='south';else if(j.y>68)entry='north';}
 if(stripOnly||trap||source==='groundskeeping bell'||source==='golf ball')entry=j.x>=0?'east':'west';
 let a=entry==='east'?east:entry==='west'?west:entry==='north'?{entry,from:{x:AMBUSH_CORRIDOR_X,y:85},to:{x:AMBUSH_CORRIDOR_X,y:31}}:{entry,from:{x:AMBUSH_CORRIDOR_X,y:31},to:{x:AMBUSH_CORRIDOR_X,y:85}};
 if(trap)a={entry:'east',from:{x:30,y:74},to:{x:-30,y:74}};
 // The swale stops the rig before the western masonry; it is deliberately
 // not a traversable end-to-end strip.
 if(!trap&&!clearAttack(a))a=j.x>=0?east:west;
 const yaw=Math.atan2(a.to.x-a.from.x,a.to.y-a.from.y);
 return {...a,yaw,axis:a.from.y===a.to.y?'x':'y',source,lockedAt:r.time};
}
export function ambushPath(j,a){
 const startSide=j.x<0?-1:1,endSide=a.entry==='west'?-1:1,outer=39;
 const points=[{x:startSide*outer,y:j.y}];
 if(startSide!==endSide)points.push({x:startSide*outer,y:101},{x:endSide*outer,y:101});
 points.push({x:endSide*outer,y:a.from.y},{...a.from});
 return points.filter((p,i)=>!i||Math.hypot(p.x-points[i-1].x,p.y-points[i-1].y)>.01);
}
// Curved, heading-matched service travel; corners never own a stop/pivot.
export const advanceAmbushTravel=(j,dt)=>advanceRollingTravel(j,dt);
export function ambushMotion(j,dt){
 const a=j.attack,dx=a.to.x-a.from.x,dy=a.to.y-a.from.y,length=Math.hypot(dx,dy),accel=AMBUSH.cutAcceleration;
 const peak=Math.min(AMBUSH.cutSpeed,Math.sqrt(accel*length)),ramp=peak/accel,rd=peak*ramp/2,duration=length/peak+ramp;
 const progress=clamp(((j.x-a.from.x)*dx+(j.y-a.from.y)*dy)/length,0,length);
 const t=progress<rd?Math.sqrt(2*progress/accel):progress<=length-rd?ramp+(progress-rd)/peak:duration-Math.sqrt(2*(length-progress)/accel);
 const time=Math.min(duration,t+dt),remaining=duration-time;
 const speed=time<ramp?accel*time:remaining<ramp?accel*remaining:peak;
 const travel=time<ramp?accel*time*time/2:remaining<ramp?length-accel*remaining*remaining/2:rd+(time-ramp)*peak;
 return {x:a.from.x+dx*travel/length,y:a.from.y+dy*travel/length,speed,done:time>=duration};
}
export function wetFooting(r){return r.water>.25&&r.player.x>2&&r.player.x<14&&r.player.y>68&&r.player.y<80&&!refuge(r.player);}
