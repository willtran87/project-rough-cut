import {createRun,step,snapshot,nearbyAction} from '../web/final-cut-sim.js';
import {distance,PUMP,BELL,SECTORS} from '../web/final-cut-course.js';
import {ACCESS} from '../web/final-cut-arrival-layout.js';
import {FINAL_ROUTES} from '../web/final-cut-route-layout.js';
import {basinById} from '../web/final-cut-basins.js';

// Map-aware pilot: every position is earned with ordinary movement inputs.
// Predicting a crossing is an automated rule check, not a human playtest.
//
// The round is the flood-and-bait loop (a501e79): prime the pump, hold the
// machine twice in fairway hollows, then flood the nursery swale and call him
// across it with the bell or by being seen on its west bank. Each risky plan is
// rehearsed in a copy of the deterministic run first and only then played for
// real, exactly as the crossing pilot below has always done.
const SHELTER={x:12,y:38},PAVILION={x:-16,y:86};
const valveSpot=b=>({x:b.valve.x,y:b.valve.y+(b.valve.y>b.y?.7:-.7)});
// Both fairway valves used here sit on the dry bank south of the middle strip.
const HOLD_ROUTES={middle:[{x:16,y:38},{x:16,y:42.85}],near:[{x:16,y:38},{x:16,y:33.15}]};
export function traverse({checkpoint=0,sprint=false,crouch=false,evidence=false,seed=0,record=false,fullyCut=false,route='direct',depleted=false,distract=false,finalRoute='bank',forkDistraction=false,visualLure=false}={}){
 let r=createRun({checkpoint,pump:checkpoint>=1,seed,route,ballCount:depleted?0:3,cut:fullyCut?SECTORS.map(s=>s.id):[]});r.mode='playing';const actions=[],passes=[],crossings=[];let observedPass=-1,observedCrossings=0;
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
 // Play a whole plan in a copy; if it works, play the same inputs for real.
 // Otherwise wait a quarter second in place (on stone) and plan again.
 const rehearse=plan=>{
  const real=r,kept=[actions.length,passes.length,crossings.length,observedPass,observedCrossings];r=structuredClone(real);let ok=false;
  try{ok=plan()===true;}catch{ok=false;}
  r=real;actions.length=kept[0];passes.length=kept[1];crossings.length=kept[2];observedPass=kept[3];observedCrossings=kept[4];return ok;
 };
 const attempt=(plans,label,limit=60*240)=>{
  for(let waited=0;waited<limit;waited+=15){
   const plan=plans().find(rehearse);
   if(plan){if(plan()!==true)throw Error('Rehearsed plan diverged: '+label);return;}
   tick({},15);if(r.mode!=='playing')break;
  }throw Error('No opportunity: '+label);
 };
 const waitFor=(done,fail,seconds)=>{for(let n=0;n<seconds*60&&r.mode==='playing'&&!done();n++){if(fail())return false;tick();}return done();};
 // A fairway hold: open the valve of a dry hollow, get back inside the pump
 // shelter, and let his next pass down that strip find full water.
 const hold=b=>()=>{
  const stage=r.stage,spot=valveSpot(b);
  for(const p of HOLD_ROUTES[b.id])walk(p.x,p.y);walk(spot.x,spot.y);useAt({id:'valve-'+b.id,x:b.valve.x,y:b.valve.y});
  for(const p of [...HOLD_ROUTES[b.id]].reverse())walk(p.x,p.y);walk(SHELTER.x,SHELTER.y);
  return waitFor(()=>r.stage>stage,()=>['draining','dry'].includes(r.basins[b.id].state),25)&&r.mode==='playing';
 };
 // The finale: flood the swale from its west bank, call him across it, and
 // be back inside the pavilion when he arrives.
 const swale=basinById('swale');
 const finale=()=>{
  const spot=valveSpot(swale);walk(-8,85);walk(spot.x,spot.y);useAt({id:'valve-swale',x:swale.valve.x,y:swale.valve.y});
  if(visualLure){
   walk(-5,74);if(!waitFor(()=>r.rig.trapApproach&&r.rig.evidence==='observed player',()=>!['filling','full'].includes(r.basins.swale.state),20))return false;
   walk(-5,82);walk(-8,85);
  }else{walk(BELL.x,BELL.y+.9);useAt(BELL);walk(-8,85);}
  walk(PAVILION.x,PAVILION.y);
  return waitFor(()=>r.won,()=>!['filling','full'].includes(r.basins.swale.state),60);
 };
 if(!checkpoint){if(route!=='direct'){walk(-2,-15);walk(-2,-2);}walk(-2,17.3);useAt(ACCESS);let wait=0;while(r.arrival.gate<1&&wait++<6000)tick();if(r.arrival.gate<1)throw Error('Course access never opened');cross(-2,33);walk(16,33);walk(16,38);walk(10,38);walk(8.5,38);useAt(PUMP);}
 if(evidence){walk(11.5,38);useAt({id:'record',x:11.5,y:36.5});}
 walk(SHELTER.x,SHELTER.y);
 while(r.stage<2)attempt(()=>['middle','near'].map(basinById).filter(b=>r.basins[b.id].state==='dry').map(hold),'fairway hold '+(r.stage+1));
 walk(16,38);walk(16,42);
 if(distract){walk(15.6,42);let wait=0;while(!(r.rig.phase==='pass'&&r.rig.lane===1&&r.rig.attack?.axis!=='y'&&Math.abs(r.rig.x-16)<8)&&wait++<9000)tick();if(wait>=9000)throw Error('No audible middle-strip approach');tick({chipStart:true,chipHeld:true});tick({chipHeld:true},72);tick({chipRelease:true});wait=0;while(!r.stats.ballRedirects&&wait++<9000)tick();if(!r.stats.ballRedirects)throw Error('Ball never selected');}
 cross(16,58);
 if(forkDistraction){walk(12,60);let audible=0;while(!(r.rig.phase==='pass'&&r.rig.lane>=1&&Math.abs(r.rig.x-12)<4)&&audible++<18000)tick();if(audible>=18000)throw Error('No audible nearby pass at fork');tick({lookX:Math.atan2(4,-10)-r.player.yaw});tick({chipStart:true,chipHeld:true});tick({chipHeld:true},19);tick({chipRelease:true});tick({lookX:-r.player.yaw});let wait=0;while(!r.stats.ballRedirects&&wait++<9000)tick();if(!r.stats.ballRedirects||r.rig.lane!==1)throw Error('Fork ball did not select middle strip');}
 for(const p of FINAL_ROUTES[finalRoute])cross(p.x,p.y);
 walk(-8,85);walk(PAVILION.x,PAVILION.y);
 attempt(()=>[finale],visualLure?'visual swale lure':'bell swale lure');
 if(!r.won)throw Error('Trap never completed');
 walk(-9,86);walk(-8,86);walk(0,92);walk(0,105);useAt({id:'road',x:0,y:104});
 return {run:r,actions,passes,crossings,save:snapshot(r)};
}
if(process.argv[1]?.endsWith('probe-final-cut.mjs')){const t=Date.now(),{run}=traverse(JSON.parse(process.argv[2]||'{}'));console.log(JSON.stringify({mode:run.mode,time:run.time,stats:run.stats,cut:run.cut,won:run.won,ms:Date.now()-t}));}
