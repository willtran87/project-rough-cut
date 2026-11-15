import {ARRIVAL_SPAWNS,BOARDING_PATH} from './final-cut-arrival-layout.js';
import {createGroundFeet,advanceGroundFeet,restoreGroundFeet,groundSnapshot} from './final-cut-footwork.js';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const pathLength=BOARDING_PATH.slice(1).reduce((n,p,i)=>n+Math.hypot(p.x-BOARDING_PATH[i].x,p.y-BOARDING_PATH[i].y),0);
export const BOARD_SPEED=1.65,BOARD_START=.5,BOARD_STOP=.5,BOARD_WALK=pathLength/BOARD_SPEED+(BOARD_START+BOARD_STOP)/2,BOARD_TURN_MOTION=.8,BOARD_TURN=1.4,BOARD_CLIMB=7.5,BOARD_STARTUP=2;
export const BOARD_READY=BOARD_WALK+BOARD_TURN+BOARD_CLIMB+BOARD_STARTUP;
export function upgradeArrivalMotion(saved){
 if(!saved||saved.motionVersion===4)return saved;
 const modern=saved.motionVersion===2||saved.motionVersion===3,oldLength=Math.hypot(.05,5.92),walk=modern?oldLength/BOARD_SPEED+(saved.motionVersion===3?BOARD_START+BOARD_STOP:BOARD_STOP)/2:Math.hypot(6,.1)/BOARD_SPEED,climb=modern?BOARD_CLIMB:3.5,start=walk+.8,end=start+climb,age=clamp(Number(saved.age)||0,0,end+BOARD_STARTUP);
 const current=age<walk?age/walk*BOARD_WALK:age<start?BOARD_WALK+age-walk:age<end?BOARD_WALK+BOARD_TURN+(age-start)/climb*BOARD_CLIMB:BOARD_WALK+BOARD_TURN+BOARD_CLIMB+age-end;
 // Old planted feet belong to the former parking location. Reconstruct them
 // on the new walk at the same narrative progress instead of stretching Joe.
 return {...saved,motionVersion:4,age:current,feet:undefined,turnRate:undefined};
}
export function boardingPose(age){
 // Decelerate over the final half second. Distance, gait and the turn all
 // share this clock, so a stopped boot cannot jump to an unrelated idle frame.
 const stop=clamp((BOARD_WALK-age)/BOARD_STOP,0,1),start=clamp(age/BOARD_START,0,1),speed=BOARD_SPEED*Math.min(start,stop),acceleration=age<BOARD_START?BOARD_SPEED/BOARD_START:age>BOARD_WALK-BOARD_STOP?-BOARD_SPEED/BOARD_STOP:0;
 let remaining=age>=BOARD_WALK?pathLength:age>BOARD_WALK-BOARD_STOP?pathLength-BOARD_SPEED*BOARD_STOP/2*stop*stop:age<BOARD_START?BOARD_SPEED*BOARD_START/2*start*start:(age-BOARD_START/2)*BOARD_SPEED,walk=0;
 for(let k=0;k<BOARDING_PATH.length-1;k++){
  const from=BOARDING_PATH[k],to=BOARDING_PATH[k+1],length=Math.hypot(to.x-from.x,to.y-from.y),travel=Math.min(remaining,length),t=travel/length;
  if(remaining<length&&age<BOARD_WALK)return {phase:'walk',x:from.x+(to.x-from.x)*t,y:from.y+(to.y-from.y)*t,yaw:Math.atan2(to.x-from.x,to.y-from.y),walk:walk+travel,speed,maxSpeed:BOARD_SPEED,acceleration,distanceToStop:pathLength-walk-travel,settle:1-stop,climb:0};
  remaining-=length;walk+=length;
 }
 // Complete the turn before climbing, allowing both sequential ground steps
 // to settle on the fixed boarding supports. No planted shoe snaps to a tread.
 const last=BOARDING_PATH.at(-1),before=BOARDING_PATH.at(-2),climbStart=BOARD_WALK+BOARD_TURN,climb=age>=climbStart+BOARD_CLIMB?1:clamp((age-climbStart)/BOARD_CLIMB,0,1),turn=clamp((age-BOARD_WALK)/BOARD_TURN_MOTION,0,1),heading=Math.atan2(last.x-before.x,last.y-before.y),seating=clamp((climb-.55)/.14,0,1);
 return {...last,phase:climb<1?'board':'cab',yaw:heading*(1-turn)-Math.PI/2*seating*seating*(3-2*seating),walk,speed:0,climb};
}
export function createArrival(saved={},route='direct',skip=false,legacy=false){
 const age=skip?BOARD_READY:clamp(Number(saved?.age)||0,0,BOARD_READY);
 const open=saved?.open===true||legacy;
 const reached=skip||route==='direct'||saved?.reached===true,joe=boardingPose(age);if(!reached){joe.phase='wait';joe.speed=0;}
 // Reconstruct old saves from the same path clock; current saves retain the
 // exact support and unfinished swing instead of choosing a new stance.
 let prior=boardingPose(0);prior.feet=createGroundFeet(prior);
 for(let t=0;!saved?.feet&&!skip&&joe.phase!=='cab'&&reached&&t<Math.min(age,BOARD_WALK+BOARD_TURN);t+=1/120){const dt=Math.min(1/120,Math.min(age,BOARD_WALK+BOARD_TURN)-t),next=boardingPose(t+dt);next.feet=prior.feet;next.turnRate=(next.yaw-prior.yaw)/dt;advanceGroundFeet(next,dt);prior=next;}
 joe.feet=saved?.feet?restoreGroundFeet(saved.feet,joe):prior.feet;
 joe.turnRate=Number.isFinite(saved?.turnRate)?clamp(saved.turnRate,-3,3):prior.turnRate||0;
 return {age,ready:age>=BOARD_READY,reached,heard:saved?.heard===true||skip,requested:open||saved?.requested===true,open,gate:open?1:0,joe};
}
export function arrivalSpawn(a,route){return {...ARRIVAL_SPAWNS[a.reached?'direct':route]||ARRIVAL_SPAWNS.direct};}
export function advanceArrival(r,dt){
 const a=r.arrival;if(r.won)return;
 if(!a.heard){a.heard=true;r.saveSerial++;r.events.push({type:r.route==='garage'?'garage-latch':r.route==='drain'?'sluice-arrival':'arrival',time:r.time,x:r.route==='garage'?-21.7:21.7,y:-15});if(r.route==='direct'&&!a.requested){r.message='Beyond the 18th: the public road. To your right, Joe leaves the equipment bay.';r.messageTime=7;}}
 if(!a.reached&&r.player.y>=-4.5&&r.player.y<8&&r.player.x>-7.5&&r.player.x<3.5){a.reached=true;r.saveSerial++;r.message='The overlook is safe. To your right, Joe leaves the equipment bay. The public road is beyond the 18th.';r.messageTime=7;}
 if(!a.reached)return;
 const before=a.ready,previous=a.joe;a.age=Math.min(BOARD_READY,a.age+dt);a.ready=a.age>=BOARD_READY;a.joe=boardingPose(a.age);a.joe.feet=previous.feet;a.joe.turnRate=dt>0?(a.joe.yaw-previous.yaw)/dt:0;if(a.joe.phase==='walk'||a.joe.phase==='board'&&!a.joe.climb)advanceGroundFeet(a.joe,dt);
 if(!before&&a.ready){r.saveSerial++;r.events.push({type:'rig-startup',time:r.time});}
 if(!a.open&&r.rig.phase==='pass'&&r.rig.lane===0&&r.rig.direction<0&&r.rig.x<-6){a.open=true;r.saveSerial++;r.events.push({type:'course-access-open',time:r.time});r.message='The rail opens behind the pass. Cross the cut strip toward the pump shelter.';r.messageTime=6;}
 if(a.open)a.gate=Math.min(1,a.gate+dt/.8);
}
export const arrivalSnapshot=r=>({motionVersion:4,age:r.arrival.age,reached:r.arrival.reached,heard:r.arrival.heard,requested:r.arrival.requested,open:r.arrival.open,feet:groundSnapshot(r.arrival.joe.feet),turnRate:r.arrival.joe.turnRate});
