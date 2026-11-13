import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,step,readSave,snapshot,CHECKPOINTS} from '../web/under-green-sim.js';
import {WATERS,waterPoint,waterLocal,inWater,waterState,pathTo,distance,solid,move,GATE,keeperInside,gateOccupied} from '../web/under-green-course.js';
import {crossingAdvice} from '../web/under-green-guidance.js';
import {traverse} from './probe-under-green-folded.mjs';
const checks=[],tick=(r,n,input={})=>{for(let i=0;i<n;i++)step(r,input);};
for(const w of WATERS)for(const local of [{x:0,y:0},{x:2,y:3},{x:-2,y:-3}])assert.deepEqual(waterLocal(waterPoint(w,local.x,local.y),w),local);
for(const w of WATERS.filter(w=>!['return','bypass'].includes(w.id)))for(const side of [-1,1]){
 const bank=waterPoint(w,0,side*(w.depth/2+.5)),green=waterState(w,-w.offset);
 assert.equal(crossingAdvice(bank,w,green).action,'cross');
 const r=createRun();r.mode='playing';r.time=-w.offset;r.joe.phase='enter';r.joe.age=-100;Object.assign(r.player,bank,{yaw:side>0?Math.PI:0});tick(r,Math.ceil((w.depth+1.1)/3.84*60),{forward:1});
 assert.equal(r.waterHits,0);assert(waterLocal(r.player,w).y*side<-w.depth/2);
}
checks.push('All relocated cyclic outlets allow ordinary walking in either direction; water transforms round-trip');
const outlet=WATERS.find(w=>w.id==='bypass');let r=createRun();r.mode='playing';Object.assign(r.player,{x:3.4,y:38,yaw:Math.PI/2});r.joe.phase='enter';r.joe.age=-100;tick(r,240,{forward:1,sprint:true});assert(r.player.x<4);assert(r.waterHits>0);
r=createRun();r.mode='playing';Object.assign(r.player,{x:6,y:38,waterEntry:{bypass:-1}});r.joe.phase='enter';r.joe.age=-100;tick(r,90);assert(r.player.x<4);assert(Math.abs(r.player.y-38)<.001);assert(!inWater(r.player,outlet));
checks.push('East-facing high pressure blocks sprinting and visibly returns the player west to the entry bank');
const before=pathTo({x:0,y:40},{x:12,y:38},0,false),after=pathTo({x:0,y:40},{x:12,y:38},0,true);
assert(distance(before.at(-1),{x:12,y:38})>4);assert(distance(after.at(-1),{x:12,y:38})<1);
checks.push('Pump drainage is physically necessary for the range; no dry path silently bypasses the closed outflow');
r=createRun(1);r.mode='playing';r.time=3;Object.assign(r.player,{x:0,y:54,yaw:0});Object.assign(r.joe,{x:0,y:59.8,phase:'water-recovery',last:{x:0,y:54},waterEntry:{spillway:-1}});tick(r,150);assert(r.joe.y<58);assert(r.joe.walk>1);
checks.push('Joe clears the complete water collision margin and resumes navigation instead of sticking at the bank');
assert(!gateOccupied({x:0,y:2}));assert(!keeperInside({x:0,y:2}));const root={x:0,y:8};move(root,0,-4,.3,true);assert(root.y<5);
for(const x of [-4,0,4])assert(solid({x:GATE.x+x,y:GATE.y},.3,true));
checks.push('Gate occupancy is local to its room; closing it cannot block the adjacent root gallery');
assert.equal(readSave(JSON.stringify({version:2,checkpoint:3,bypass:true})).checkpoint,2);
assert.equal(readSave(JSON.stringify({version:3,checkpoint:3,bypass:true})).checkpoint,3);
for(let cp=0;cp<CHECKPOINTS.length;cp++){const run=createRun(cp);assert(!solid(run.player,.3));assert(!solid(run.joe,.4));assert.equal(readSave(JSON.stringify(snapshot(run))).checkpoint,cp);}
checks.push('Version 3 saves keep new checkpoints; old pre-range checkpoint migrates to the solved pump, without skipping the new range');
const runs=[traverse({dodge:true}),traverse({wet:true,dodge:true}),traverse({decisionPause:3,dodge:true}),traverse({sprint:true,dodge:true}),traverse({optional:true,dodge:true}),...[1,2,3].map(cp=>traverse({cp,dodge:true}))];
// Preserve the existing contact budgets. Changed pursuit can shift arrival
// into an earlier safe opening; a route clearing without its old hit is valid.
const maximumHits=[1,0,0,0,0,1,0,0];
for(const [index,run]of runs.entries()){assert.equal(run.mode,'complete',`route ${index}`);assert(run.waterHits<=maximumHits[index],`route ${index}: ${run.waterHits} water hits`);assert(!run.solid);}
assert(runs[1].checkpoint===3);assert(runs[4].evidence);assert(runs[0].gap<60);
// A complete fast route may legitimately earn a clean escape. Test committed
// attack counterplay at the service encounter itself, independent of subsequent
// locomotion/arrival tuning that changes whether that route meets Joe there.
function service(){const r=createRun(2);r.mode='playing';r.time=44.53;r.bypassAt=42.38;Object.assign(r.player,{x:-16.05,y:40,yaw:Math.PI/2,grace:0});Object.assign(r.joe,{x:-14.52,y:40,yaw:-Math.PI/2,phase:'windup',age:0,last:{x:-16.05,y:40},seen:true});return r;}
const ignored=service();tick(ignored,102,{forward:1});assert.equal(ignored.mode,'caught');
const evaded=service();tick(evaded,24,{strafe:-1});tick(evaded,63,{forward:1});assert.equal(evaded.mode,'playing');assert(evaded.player.x>evaded.joe.x+1);assert(evaded.player.y>41.4);assert.equal(evaded.waterHits,0);
checks.push('At the service-exit windup, continuing forward is captured; ordinary lateral movement then forward travel clears the committed sweep');
checks.push('Actual walking, sprinting, wet crossings, deliberate observation pauses, evidence and every checkpoint all reach a valid escape');
fs.mkdirSync('output/under-green/folded',{recursive:true});fs.writeFileSync('output/under-green/folded/rules.json',JSON.stringify({passed:true,checks,runs:runs.map(({j,p,reached,...r})=>r)},null,2));console.log(JSON.stringify({passed:true,checks}));
