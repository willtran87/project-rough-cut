import {createRun,step,snapshot,nearbyAction} from '../web/final-cut-sim.js';
import {distance,LANES,PUMP,BELL,SECTORS} from '../web/final-cut-course.js';
import {ACCESS} from '../web/final-cut-arrival-layout.js';
import {FINAL_ROUTES} from '../web/final-cut-route-layout.js';

// Map-aware pilot: every position is earned with ordinary movement inputs.
// Predicting a crossing is an automated rule check, not a human playtest.
export function traverse({checkpoint=0,sprint=false,crouch=false,evidence=false,seed=0,record=false,fullyCut=false,route='direct',depleted=false,distract=false,finalRoute='bank',forkDistraction=false,visualLure=false}={}){
 const r=createRun({checkpoint,pump:checkpoint>=1,seed,route,ballCount:depleted?0:3,cut:fullyCut?SECTORS.map(s=>s.id):[]});r.mode='playing';const actions=[],passes=[],crossings=[];let observedPass=-1,observedCrossings=0;
 const tick=(i={},frames=1)=>{for(let k=0;k<frames;k++){step(r,i,1/60);if(record)actions.push(i);if(r.rig.phase==='pass'&&r.rig.passSerial!==observedPass){observedPass=r.rig.passSerial;passes.push({time:r.time,lane:r.rig.lane,direction:r.rig.direction,evidence:r.rig.evidence});}if(r.stats.crossings.length>observedCrossings){observedCrossings=r.stats.crossings.length;crossings.push({time:r.time,lane:r.stats.crossings.at(-1),rigLane:r.rig.lane,rigPhase:r.rig.phase,cut:r.cut.length});}if(!['playing','aftermath'].includes(r.mode))break;}};
 const walk=(x,y)=>{
  let frames=0;while(distance(r.player,{x,y})>.045&&frames++<6000&&['playing','aftermath'].includes(r.mode)){
   const dx=x-r.player.x,dy=y-r.player.y,d=Math.hypot(dx,dy),speed=crouch?2.4:sprint?6.08:3.84,scale=Math.min(1,d/(speed/60));
   const yaw=r.player.yaw;tick({forward:(dy*Math.cos(yaw)+dx*Math.sin(yaw))/d*scale,strafe:(dx*Math.cos(yaw)-dy*Math.sin(yaw))/d*scale,sprint,crouch});
  }if(frames>=6000||r.mode==='caught')throw Error('Pilot stuck/caught: '+JSON.stringify({target:{x,y},player:r.player,rig:r.rig,mode:r.mode}));
 };
 const useAt=(target)=>{tick({lookX:Math.atan2(target.x-r.player.x,target.y-r.player.y)-r.player.yaw});if(nearbyAction(r)?.id!==target.id)throw Error('Unreachable '+target.id);tick({use:true});tick({lookX:-r.player.yaw});};
 const cross=(x,y)=>{
  // Wait only at a dry bank. Attempt the entire crossing in a copy first.
  let waited=0;while(waited<9000){
   const copy=structuredClone(r),dx=x-copy.player.x,dy=y-copy.player.y,length=Math.hypot(dx,dy),speed=crouch?2.4:sprint?6.08:3.84,frames=Math.ceil(length/speed*60),yaw=copy.player.yaw;
   const input={forward:(dy*Math.cos(yaw)+dx*Math.sin(yaw))/length,strafe:(dx*Math.cos(yaw)-dy*Math.sin(yaw))/length,sprint,crouch};
   for(let i=0;i<frames&&copy.mode!=='caught';i++)step(copy,input,1/60);
   if(copy.mode!=='caught'&&distance(copy.player,{x,y})<.15){walk(x,y);return;}tick({},15);waited+=15;
  }throw Error('No crossing opportunity');
 };
 if(!checkpoint){if(route!=='direct'){walk(-2,-15);walk(-2,-2);}walk(-2,17.3);useAt(ACCESS);let wait=0;while(r.arrival.gate<1&&wait++<6000)tick();if(r.arrival.gate<1)throw Error('Course access never opened');cross(-2,33);walk(16,33);walk(16,38);walk(10,38);walk(8.5,38);useAt(PUMP);}
 if(evidence){walk(11.5,38);useAt({id:'record',x:11.5,y:36.5});}
 walk(16,38);walk(16,42);
 if(distract){walk(15.6,42);let wait=0;while(!(r.rig.phase==='pass'&&r.rig.lane===1&&r.rig.attack?.axis!=='y'&&Math.abs(r.rig.x-16)<8)&&wait++<9000)tick();if(wait>=9000)throw Error('No audible middle-strip approach');tick({chipStart:true,chipHeld:true});tick({chipHeld:true},72);tick({chipRelease:true});wait=0;while(!r.stats.ballRedirects&&wait++<9000)tick();if(!r.stats.ballRedirects)throw Error('Ball never selected');}
 cross(16,58);
 if(forkDistraction){walk(12,60);let audible=0;while(!(r.rig.phase==='pass'&&r.rig.lane>=1&&Math.abs(r.rig.x-12)<4)&&audible++<18000)tick();if(audible>=18000)throw Error('No audible nearby pass at fork');tick({lookX:Math.atan2(4,-10)-r.player.yaw});tick({chipStart:true,chipHeld:true});tick({chipHeld:true},19);tick({chipRelease:true});tick({lookX:-r.player.yaw});let wait=0;while(!r.stats.ballRedirects&&wait++<9000)tick();if(!r.stats.ballRedirects||r.rig.lane!==1)throw Error('Fork ball did not select middle strip');}
 for(const p of FINAL_ROUTES[finalRoute])cross(p.x,p.y);
 if(visualLure){
  walk(-5,74);let seenWait=0;
  while(!(r.rig.trapApproach&&r.rig.evidence==='observed player')&&seenWait++<15000)tick();
  if(seenWait>=15000)throw Error('Visible player did not earn the swale approach');
  walk(-5,82);walk(-8,85);
 }else{walk(-8,85);walk(-9.1,85);useAt(BELL);}
 walk(-16,86);
 let wait=0;while(!r.won&&wait++<15000)tick();if(!r.won)throw Error('Trap never completed');
 walk(-9,86);walk(-8,86);walk(0,92);walk(0,105);useAt({id:'road',x:0,y:104});
 return {run:r,actions,passes,crossings,save:snapshot(r)};
}
if(process.argv[1]?.endsWith('probe-final-cut.mjs')){const {run}=traverse();console.log(JSON.stringify({mode:run.mode,time:run.time,stats:run.stats,cut:run.cut,won:run.won}));}
