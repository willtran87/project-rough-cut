import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,step,snapshot,readSave,nearbyAction} from '../web/under-green-sim.js';
import {WATERS,waterState,gateBlocks,move,LEVER,SLUICE,GATE} from '../web/under-green-course.js';
import {crossingAdvice} from '../web/under-green-guidance.js';
import {actionBindings,keyLabel} from '../web/control-profiles.js';
const checks=[],tick=(r,n,input={})=>{for(let i=0;i<n;i++)step(r,input);};
let r=createRun(1,true);r.mode='playing';Object.assign(r.player,{x:LEVER.x,y:LEVER.y+1,yaw:Math.PI});step(r,{use:true});assert(r.bypass);
const save=readSave(JSON.stringify(snapshot(r))),loaded=createRun(save.checkpoint,save.evidence,save.difficulty,save);
assert(loaded.bypass&&loaded.evidence);assert.equal(loaded.checkpoint,2);
assert(waterState(WATERS.find(w=>w.id==='return'),loaded.time,loaded.bypass,loaded.bypassAt).danger);
assert(readSave(JSON.stringify({version:1,checkpoint:2})).bypass);
assert(!readSave(JSON.stringify({version:1,checkpoint:1})).bypass);
assert.equal(readSave('{broken'),null);assert.equal(readSave('{"version":99}'),null);
checks.push('Immediate bypass save and retry preserve durable facts; v1 migration infers only earned progress');

const back=WATERS.find(w=>w.id==='return'),out=WATERS.find(w=>w.id==='bypass');
for(const w of WATERS)for(const t of [0,1,2,4.5,6.5,10,11.999,12])for(const bypass of [false,true]){
 const s=waterState(w,t,bypass,0);assert(s.timing);assert.notEqual(s.remaining,99);
 if(s.timing.kind==='timed'){assert(Number.isFinite(s.remaining));assert(Number.isFinite(s.safeFor));}
 else assert.equal(s.remaining,null);
}
assert.equal(waterState(back,40,true,39).safeFor,1);
assert.equal(waterState(back,40,true,39).timing.kind,'timed');
assert.equal(waterState(out,40,true,39).timing.kind,'safe-until-event');
assert.equal(waterState(out,40,false).timing.kind,'blocked-until-event');
checks.push('Every outlet has timed or explicit event-controlled state, including the two-second return warning');

const spill=WATERS.find(w=>w.id==='spillway'),green=waterState(spill,9);
assert.equal(crossingAdvice({x:0,y:48},spill,green).action,'wait');
assert.equal(crossingAdvice({x:0,y:59.5},spill,green).action,'cross');
assert.equal(crossingAdvice({x:0,y:59.5},spill,green,2.4).action,'cross');
const late=waterState(spill,11);
assert.equal(crossingAdvice({x:0,y:59.5},spill,late,2.4).action,'wait');
const almostAcross=crossingAdvice({x:0,y:67,waterEntry:{spillway:-1}},spill,late);
assert.equal(almostAcross.action,'clear');assert(almostAcross.remaining<1.5);
assert.equal(crossingAdvice({x:back.x,y:back.y+5},back,waterState(back,40,true,39)).action,'wait');
checks.push('Advice includes approach, stance and remaining crossing distance, without imaginary sprint requirements');

r=createRun(3);r.mode='playing';Object.assign(r.player,{x:GATE.x-3.5,y:SLUICE.y});assert.equal(nearbyAction(r),null);
Object.assign(r.player,{x:SLUICE.x,y:SLUICE.y+1,yaw:0});assert.equal(nearbyAction(r),null);
r.player.yaw=Math.PI;assert.equal(nearbyAction(r)?.id,'gate');
step(r,{use:true});assert(r.closing);step(r,{use:true});assert(r.closing);
const fraction=r.gate;r.mode='paused';tick(r,60);assert.equal(r.gate,fraction);r.mode='playing';
Object.assign(r.player,{x:GATE.x,y:GATE.y+1});tick(r,1);assert(!r.closing);assert.equal(r.mode,'playing');
tick(r,120);assert.equal(r.gate,0);assert(!r.finished);
Object.assign(r.player,{x:SLUICE.x,y:SLUICE.y+1,yaw:Math.PI});step(r,{use:true});tick(r,90);assert.equal(r.mode,'aftermath');tick(r,280);assert.equal(r.mode,'complete');
checks.push('Visible console reach/facing, repeated use, pause, unsafe-side cancellation, reopening and safe completion');

r=createRun(3);r.mode='playing';r.closing=true;r.gate=.7;
Object.assign(r.player,{x:GATE.x,y:GATE.y+3,grace:0});Object.assign(r.joe,{x:GATE.x,y:GATE.y+5,phase:'walk',last:{x:GATE.x,y:GATE.y+3}});
tick(r,1);assert.notEqual(r.joe.phase,'blocked');assert(!r.closing);
r=createRun(3);r.mode='playing';r.closing=true;r.gate=.3;Object.assign(r.player,{x:GATE.x,y:SLUICE.y});Object.assign(r.joe,{x:GATE.x,y:GATE.y+.6});step(r);
assert(!r.closing);assert.equal(r.mode,'playing');
assert(gateBlocks(.5,1.8));assert(!gateBlocks(.5,1.25));
for(const height of [1.25,1.8,1.9]){
 const p={x:GATE.x,y:GATE.y+1};move(p,0,-2,.3,gateBlocks(.9,height));assert(p.y>GATE.y);
}
checks.push('Gate uses physical clearance, rejects Joe at threshold and never freezes Joe beside an unsafe player');

const b=actionBindings('onFoot',{interact:'KeyT',look_back:'KeyY',move_up:'Unidentified'});
assert.equal(b.interact,'KeyT');assert.equal(keyLabel(b.interact),'T');assert.equal(keyLabel(b.look_back),'Y');assert.equal(b.move_up,'KeyW');
assert.equal(actionBindings('chase').look_back,'KeyQ');
checks.push('Action labels resolve actual validated profile bindings; chase defaults stay distinct');
fs.mkdirSync('output/under-green/build',{recursive:true});
fs.writeFileSync('output/under-green/build/rules.json',JSON.stringify({passed:true,checks},null,2));
console.log(JSON.stringify({passed:true,checks},null,2));
