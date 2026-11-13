import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,step,snapshot,readSave} from '../web/final-cut-sim.js';
import {RIG,LANES,SECTORS,MOVEMENT,distance,lineClear,solid,concealed} from '../web/final-cut-course.js';
import {FORK,FINAL_ROUTES,ROUTE_WALLS} from '../web/final-cut-route-layout.js';
import {middleCoverWarning} from '../web/final-cut-crossings.js';
import {approachingCut,cutWarningSeconds,finalCutMessages} from '../web/final-cut-messages.js';
import {traverse} from './probe-final-cut.mjs';
import {planChip} from '../web/final-cut-balls.js';
const checks=[],warnings=[],phases=[],runs=[];
const tick=(r,t,input={},hz=60)=>{for(let k=0;k<Math.round(t*hz)&&r.mode==='playing';k++)step(r,input,1/hz);};
function fixture(){const r=createRun({checkpoint:1});r.mode='playing';r.pump=false;r.water=0;return r;}

// Leave the center in the current stance after a real reaction delay. This
// uses the danger boundary and physical contact, not a duplicate hit formula.
for(const stance of ['walk','crouch','listen'])for(const hz of [30,60,120])for(const direction of [-1,1]){
 const r=fixture(),input={crouch:stance==='crouch',focus:stance==='listen'};
 Object.assign(r.player,{x:0,y:50,yaw:0,crouch:input.crouch,focus:input.focus});
 const seconds=cutWarningSeconds(r);
 Object.assign(r.rig,{x:-direction*(RIG.halfLength+.3+RIG.speed*seconds-.01),y:50,direction,yaw:direction*Math.PI/2,phase:'pass',deployment:1,lane:1});
 assert(approachingCut(r));tick(r,.55,input,hz);tick(r,3,{...input,forward:1},hz);assert.equal(r.mode,'playing');assert(r.player.y>55.7);
 warnings.push({stance,hz,direction,seconds});
}
checks.push('18 actual escapes: walk/crouch/listen, 550ms reaction, both directions and 30/60/120Hz clear the cutting strip without sprint');

// A player in familiar middle rough can heed the advance announcement, move
// south onto a dry bank, and watch that exact cover disappear in the sweep.
for(const hz of [30,60,120]){
 const r=fixture();Object.assign(r.player,{x:17,y:49,yaw:0,crouch:true});assert(concealed(r));
 assert(middleCoverWarning(r));assert.match(finalCutMessages(r,{subtitles:true}).caption,/Middle rough is next/);
 tick(r,.55,{crouch:true},hz);tick(r,2.4,{crouch:true,forward:-1},hz);assert(r.player.y<44.3);assert.equal(r.mode,'playing');
 tick(r,10,{},hz);assert.equal(r.mode,'playing');assert(r.cut.includes('rough-1-2'));assert(r.crossings.middleAnnounced&&r.crossings.middleCut);
 const restored=createRun(readSave(JSON.stringify(snapshot(r))));assert.deepEqual(restored.crossings,r.crossings);
 Object.assign(r.player,{x:17,y:49,crouch:true});assert(!concealed(r));
}
let r=fixture();Object.assign(r.player,{x:17,y:49});r.rig.phase='pass';r.rig.deployment=1;r.rig.x=24;r.rig.yaw=-Math.PI/2;r.player.crouch=true;
assert.equal(finalCutMessages(r,{subtitles:true}).kind,'danger');r.mode='paused';assert(!middleCoverWarning(r));r=fixture();Object.assign(r.player,{x:17,y:49});r.cut=SECTORS.map(s=>s.id);assert(!middleCoverWarning(r));
checks.push('Middle announcement permits a crouched retreat before the actual sweep removes familiar concealment; state survives save, danger takes priority, already cut/paused terrain gives no false cover warning');
r=fixture();Object.assign(r.player,{x:22,y:49,crouch:true});r.cutAreas=[{y:50,lo:-34,hi:18}];assert(concealed(r));assert(middleCoverWarning(r),'A partially cut center must not suppress the remaining rough warning');

for(const w of ROUTE_WALLS)for(const y of LANES)assert(Math.abs(w.y-y)>=RIG.halfWidth+w.d/2,'Masonry intrudes into a scheduled pass');
assert(!lineClear({x:0,y:56.8},{x:0,y:66}));assert(lineClear({x:6,y:56.8},{x:6,y:66}));assert(lineClear({x:12,y:60},{x:12,y:66}));
for(const route of Object.values(FINAL_ROUTES)){let a=FORK;for(const b of route){const d=distance(a,b);for(let n=0;n<=Math.ceil(d*10);n++){const t=n/Math.ceil(d*10);assert(!solid({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t}),`Blocked authored route ${JSON.stringify({a,b,t})}`);}a=b;}}
checks.push('Both marked paths have physical body clearance; tall west bank blocks sight, low east bank and short crossing are exposed; masonry clears all three deployed strips');
r=fixture();Object.assign(r.player,{x:5,y:66,crouch:true});assert(!concealed(r),'The widened view gap must not conceal a player');r.player.x=-2;assert(concealed(r));r.cut.push('rough-2-1');assert(!concealed(r));const restoredPatch=createRun(readSave(JSON.stringify(snapshot(r))));assert(restoredPatch.cut.includes('rough-2-1'));
checks.push('The final gap is genuinely exposed, the remaining central rough still conceals crouching, and its existing sector ID retains cut state through save/reload');
r=fixture();Object.assign(r.player,{x:12,y:58.4,yaw:-Math.PI/2});assert.equal(planChip(r,0).obstacle,'fork-sign');Object.assign(r.player,{x:12,y:60,yaw:Math.atan2(4,-10)});assert(!planChip(r,.28).blocked);
checks.push('The fork board blocks a shot into its visible face while the intended backward middle-strip shot clears it');

function finishRoute(source,name){
 const r=structuredClone(source),start=r.time;let exposure=0,travel=0;
 const inputTo=(r,p)=>{const dx=p.x-r.player.x,dy=p.y-r.player.y,d=Math.hypot(dx,dy),v=Math.min(1,d/(MOVEMENT.walk/60)),yaw=r.player.yaw;return {forward:(dy*Math.cos(yaw)+dx*Math.sin(yaw))/d*v,strafe:(dx*Math.cos(yaw)-dy*Math.sin(yaw))/d*v};};
 for(const p of FINAL_ROUTES[name]){
  let ready=false;for(let wait=0;wait<600;wait++){
   const copy=structuredClone(r);for(let k=0;k<1800&&copy.mode==='playing'&&distance(copy.player,p)>.04;k++)step(copy,inputTo(copy,p),1/60);
   if(copy.mode==='playing'&&distance(copy.player,p)<.04){ready=true;break;}tick(r,.1);
  }assert(ready,'No valid route window');
  for(let k=0;k<1800&&distance(r.player,p)>.04;k++){
   const before={...r.player};step(r,inputTo(r,p),1/60);assert.equal(r.mode,'playing');travel+=distance(before,r.player);
   if(Math.abs(r.player.y-66)<5.7)exposure+=1/60;
  }assert(distance(r.player,p)<.04);
 }
 return {seconds:r.time-start,travel,exposure};
}
for(const direction of [-1,1])for(const x of [-29,-20,-10,0,10,20,29]){
 const r=fixture();Object.assign(r.player,FORK);r.cut=SECTORS.map(s=>s.id);
 Object.assign(r.rig,{x,y:66,lane:2,phase:'pass',yaw:direction*Math.PI/2,direction,deployment:1});
 const bank=finishRoute(r,'bank'),open=finishRoute(r,'open');phases.push({direction,x,bank,open,faster:bank.seconds<open.seconds?'bank':'open'});
}
assert(phases.some(p=>p.faster==='bank'),'Protected approach never wins a sampled phase');assert(phases.some(p=>p.faster==='open'),'Open crossing never wins a sampled phase');
assert(phases.every(p=>p.bank.travel>p.open.travel&&p.bank.exposure<p.open.exposure));
checks.push('14 final-pass phases: both routes complete on fully cut ground; short route reduces distance, bank route reduces strip exposure, each arrives first in some phases');

for(const finalRoute of ['bank','open'])for(const fullyCut of [false,true]){const {run}=traverse({finalRoute,fullyCut,depleted:true});assert(run.completed);assert.equal(run.captures,0);assert.equal(run.ballCount,0);runs.push({finalRoute,fullyCut,seconds:run.elapsed,balls:0});}
const {run}=traverse({finalRoute:'open',forkDistraction:true});assert(run.completed);assert.equal(run.captures,0);assert.equal(run.stats.ballRedirects,1);runs.push({finalRoute:'open',forkDistraction:true,seconds:run.elapsed,balls:run.stats.balls});
checks.push('Five complete ordinary-control finales: both paths with standing/fully cut rough and no balls; fork shot behind the player selects middle strip before taking the open final crossing and bell ending');
fs.mkdirSync('output/final-cut/crossings',{recursive:true});fs.writeFileSync('output/final-cut/crossings/rules.json',JSON.stringify({passed:true,checks,warnings,phases,runs},null,2));console.log(JSON.stringify({passed:true,checks,phases,runs},null,2));
