import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,step,snapshot,readSave,objective,threat} from '../web/final-cut-sim.js';
import {lineClear,concealed,SECTORS} from '../web/final-cut-course.js';
import {traverse} from './probe-final-cut.mjs';

const checks=[],selections=[],runs=[];
function fixture({side=1,x=-5,y=74,water=1,crouch=false}={}){
 const r=createRun({checkpoint:1});r.mode='playing';r.water=water;
 Object.assign(r.player,{x,y,yaw:0,crouch});
 // Observe from the playable side of the new reed screen, then finish the
 // pass behind it. Selection may remember that sighting, not see through grass.
 Object.assign(r.rig,{x:side*24,y:66,phase:'waiting'});r.arrival.requested=false;
 step(r,{crouch},1/120);
 r.arrival.requested=true;
 Object.assign(r.rig,{x:side*30,y:66,lane:2,yaw:side*Math.PI/2,phase:'disengage',age:2.2,deployment:0});
 return r;
}
// Isolated perception fixtures distinguish visible bait from cover, ordinary
// mowing and an unprepared basin. These are not complete-route evidence.
for(const side of [-1,1])for(const hz of [30,60,120]){
 const r=fixture({side});assert(lineClear(r.rig,r.player));
 step(r,{},1/hz);assert.equal(r.rig.evidence,'observed player');assert(r.rig.trapApproach);
 assert.equal(r.rig.path.at(-1).y,74);assert.equal(r.rig.path.at(-1).x,30);
 assert.equal(r.events.filter(e=>e.type==='visual-lure').length,1);
 assert.match(objective(r),/pavilion/i);
 const selected={side,hz,path:structuredClone(r.rig.path),player:{x:r.player.x,y:r.player.y}};
 // Walk out of the intended strip. The approach must keep its selected
 // destination even after Joe loses line of sight inside the refuge.
 const walk=(x,y)=>{for(let n=0;n<hz*30;n++){
  const dx=x-r.player.x,dy=y-r.player.y,d=Math.hypot(dx,dy);if(d<.05)return;
  const scale=Math.min(1,d/(3.84/hz));step(r,{forward:dy/d*scale,strafe:dx/d*scale},1/hz);
  assert.notEqual(r.mode,'caught');assert.equal(r.rig.evidence,'observed player');assert(r.rig.trapApproach);
 }throw Error('Retreat obstructed');};
 walk(-5,82);walk(-8,85);walk(-16,86);walk(-12,89);assert(!lineClear(r.rig,r.player));
 let warning=false;for(let n=0;n<hz*120&&!r.won;n++){
  step(r,{},1/hz);if(r.rig.phase==='announce'){assert.match(threat(r),/FLOODED SWALE/);warning=true;}
 }
 assert(warning);assert(r.won);assert.equal(r.checkpoint,2);assert(readSave(JSON.stringify(snapshot(r))).won);
 selected.seconds=r.time;selected.wreck={x:r.rig.x,y:r.rig.y};selections.push(selected);
}
checks.push('Both headlands at 30/60/120 Hz: actual sight selects one approach; walking retreat and lost sight do not retarget it; physical bogging saves victory');
for(const config of [{x:-16,y:86},{x:-5,y:69.2,crouch:true},{x:0,y:74},{water:0},{water:.5}]){
 const r=fixture(config),hidden=!lineClear(r.rig,r.player)||concealed(r);
 step(r,{crouch:!!config.crouch},1/60);assert(!r.rig.trapApproach);
 assert(!r.events.some(e=>e.type==='visual-lure'));if(hidden)assert.notEqual(r.rig.evidence,'observed player');
}
checks.push('Masonry, uncut crouch cover, wrong side of swale and incomplete saturation do not grant a visual trap approach');
const late=fixture();Object.assign(late.rig,{phase:'pass',age:1,x:20,direction:-1,yaw:-Math.PI/2,deployment:1});
step(late,{},1/60);assert(!late.rig.trapApproach);assert.equal(late.rig.y,66);assert(!late.events.some(e=>e.type==='visual-lure'));
checks.push('Entering the bait position does not bend an already committed ordinary pass');
for(const options of [
 {},{route:'garage',finalRoute:'open'},{route:'drain'},{sprint:true},{crouch:true},
 {seed:1},{seed:2},{fullyCut:true},{checkpoint:1,fullyCut:true,depleted:true},
]){
 const {run:r}=traverse({...options,visualLure:true});
 assert.equal(r.mode,'complete');assert.equal(r.captures,0);assert.equal(r.stats.lures,0);assert.equal(r.stats.balls,0);
 assert(r.won&&r.completed);assert.equal(r.rig.evidence,'observed player');
 if(options.fullyCut)assert.equal(r.cut.length,SECTORS.length);
 runs.push({options,seconds:r.elapsed,captures:r.captures,bells:r.stats.lures,balls:r.stats.balls});
}
checks.push('Nine complete ordinary-control simulation routes: all entries, open/bank paths, walk/sprint/crouch, both replay plans, fully cut ground and prepared/depleted checkpoint; no bells, balls or captures');
fs.mkdirSync('output/final-cut/visual-lure',{recursive:true});
fs.writeFileSync('output/final-cut/visual-lure/rules.json',JSON.stringify({passed:true,checks,selections,runs},null,2));
console.log(JSON.stringify({passed:true,checks,selections,runs},null,2));
