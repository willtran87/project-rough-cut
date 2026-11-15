import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,step} from '../web/under-green-sim.js';
import {WATERS,waterState,distance,solid} from '../web/under-green-course.js';
import {planJoeRoute,crossingWait} from '../web/under-green-navigation.js';
import {updatePump,PUMP_KNOCKS} from '../web/under-green-pump.js';
const checks=[],runs=[];
const spill=WATERS.find(w=>w.id==='spillway');
assert.equal(waterState(spill,1).phase,'warning');
assert.equal(waterState(spill,2.5).danger,true);
assert.equal(crossingWait(spill,9,10/2.1,false,0),0);
assert.equal(crossingWait(spill,9,10/1.65,false,0),Infinity);
checks.push('The 5.5-second spillway opening admits a complete standard-speed crossing; slower Joe selects a detour');
for(const id of ['spillway','bunker','range-a','range-b'])for(let phase=0;phase<12;phase++){
 const w=WATERS.find(w=>w.id===id),r=createRun(2);r.mode='playing';r.time=phase-w.offset;
 Object.assign(r.player,{x:w.x,y:w.y-w.depth/2-2,grace:999});
 Object.assign(r.joe,{x:w.x,y:w.y+w.depth/2+1,yaw:Math.PI,phase:'walk',last:{...r.player}});
 let waterRecoveries=0,maximumStep=0,reached=false;
 for(let i=0;i<2400;i++){
  const before={...r.joe};step(r);maximumStep=Math.max(maximumStep,distance(before,r.joe));
  if(r.joe.phase==='water-recovery')waterRecoveries++;
  assert(!solid(r.joe,.72));
  if(distance(r.joe,r.player)<1.7){reached=true;break;}
 }
 runs.push({id,phase,reached,seconds:r.elapsed,waterRecoveries,maximumStep});
 assert(reached,JSON.stringify(runs.at(-1)));
 assert.equal(waterRecoveries,0,JSON.stringify(runs.at(-1)));
 assert(maximumStep<=2.1/60+.00001);
}
checks.push('48 arrival-phase scenarios reach observed targets without walking into a foreseeable surge or exceeding walking speed');
// Planning accepts evidence positions, never a run/player object.
const point={x:12,y:33,yaw:Math.PI},target={x:12,y:24};
const routes=[0,4,8].map(time=>planJoeRoute(point,target,time,{bypass:true}));
assert(routes.some(route=>route.some(p=>p.crossing)));
assert(routes.every(route=>route.length>0));
let r=createRun(2);r.mode='playing';r.bypassAt=r.time;r.joe.phase='search';Object.assign(r.joe,{x:0,y:50});
for(let i=0;i<180;i++){r.time+=1/60;updatePump(r,1/60);}
const knocks=r.events.filter(e=>e.type==='pipe-knock');assert.equal(knocks.length,3);
assert.deepEqual(knocks.map(({id,x,y})=>({id,x,y})),PUMP_KNOCKS.map(({id,x,y})=>({id,x,y})));
r=createRun(2);r.mode='playing';for(let i=0;i<60;i++){r.time+=1/60;updatePump(r,1/60);}assert.equal(r.events.length,0);
checks.push('Pump sequence emits three fixed-world evidence cues once; restoring durable progress does not replay them');
r=createRun(1);r.mode='playing';r.time=20;Object.assign(r.joe,{x:0,y:69,yaw:0,phase:'walk'});Object.assign(r.player,{x:-2,y:73,yaw:0,grace:999});step(r);assert(!r.joe.sawBunkerRoute);step(r,{strafe:-1});assert(r.joe.sawBunkerRoute);
const hiddenRuns=[{x:-25,y:40},{x:21,y:20}].map(player=>{const copy=structuredClone(r);Object.assign(copy.player,player);for(let i=0;i<225;i++){const previous={...copy.joe};step(copy);assert(distance(previous,copy.joe)<=2.1/60+.00001);}return copy;});
assert(hiddenRuns.every(r=>r.joe.bunkerInspectionUsed));
assert.deepEqual(hiddenRuns[0].joe.last,hiddenRuns[1].joe.last);assert.equal(hiddenRuns[0].joe.x,hiddenRuns[1].joe.x);assert.equal(hiddenRuns[0].joe.y,hiddenRuns[1].joe.y);
const unseen=structuredClone(r);unseen.joe.sawBunkerRoute=false;Object.assign(unseen.player,{x:21,y:20});for(let i=0;i<225;i++)step(unseen);assert(!unseen.joe.bunkerInspectionUsed);
checks.push('Service-exit inspection requires a real bunker-route sighting, uses continuous walking and is independent of the hidden player destination');
fs.mkdirSync('output/under-green/navigation',{recursive:true});fs.writeFileSync('output/under-green/navigation/simulation.json',JSON.stringify({passed:true,checks,runs},null,2));
console.log(JSON.stringify({passed:true,checks,runs}));
