import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRun,step} from '../web/under-green-sim.js';
import {WATERS,waterPoint,waterState,inWater,distance,solid} from '../web/under-green-course.js';
import {JOE_RADIUS} from '../web/under-green-clearance.js';

const out='output/under-green/close-recovery';fs.mkdirSync(out,{recursive:true});
const baseline=process.argv.includes('--baseline'),rows=[],examples=[],failures=[];
if(baseline&&fs.existsSync(out+'/baseline.json'))throw Error('Preserve the retained pre-fix baseline; run without --baseline to verify current behavior.');

// Valid warning-boundary fixtures: both actors already occupy the channel.
// The actual water transition starts recovery; no recovery flags are injected.
function fixture(w,side,lateral,dt){
 const r=createRun();r.mode='playing';r.bypass=true;
 r.time=24+(w.lowSeconds??3)+1.5-w.offset-dt/2;
 if(w.id==='return')r.bypassAt=r.time-2+dt/2;
 Object.assign(r.player,waterPoint(w,0,side*(w.depth/2-.1)),{yaw:side>0?0:Math.PI,grace:0});
 Object.assign(r.joe,waterPoint(w,lateral,side*(w.depth/2-.1)),{phase:'walk',yaw:side>0?0:Math.PI,last:{...r.player}});
 assert(!solid(r.player,.3)&&!solid(r.joe,JOE_RADIUS));
 assert(!waterState(w,r.time,r.bypass,r.bypassAt).danger);
 return r;
}

for(const w of WATERS.filter(w=>!['lesson','bypass'].includes(w.id)))
 for(const side of [-1,1])for(const sign of [-1,1])for(const gap of [.66,.7,.74,.8])for(const hz of [30,60,120]){
  const dt=1/hz,r=fixture(w,side,sign*gap,dt),initial=structuredClone(r),frames=[];
  let maxStep=0,closerSteps=0,overlaps=0,protectedCapture=false;
  for(let frame=0;frame<Math.ceil(.6/dt)&&r.mode==='playing';frame++){
   const before={...r.player},joeBefore={...r.joe};step(r,{},dt);
   const moved=distance(before,r.player);maxStep=Math.max(maxStep,moved);
   if(moved>1e-8&&distance(r.player,joeBefore)<Math.min(.75,distance(before,joeBefore))-1e-6)closerSteps++;
   if(solid(r.player,.3)||solid(r.joe,JOE_RADIUS))overlaps++;
   protectedCapture ||= r.mode==='caught'&&!!before.recovery?.protected;
   frames.push({frame,time:r.time,player:{...r.player},joe:{...r.joe},hits:r.waterHits,mode:r.mode});
  }
  const row={channel:w.id,side,sign,gap,hz,mode:r.mode,hits:r.waterHits,cleared:!inWater(r.player,w,.3),travel:distance(initial.player,r.player),maxStep,closerSteps,overlaps,protectedCapture};
  rows.push(row);
  if(!row.cleared||row.hits!==1||row.overlaps||row.closerSteps||row.protectedCapture||row.maxStep>8*dt+1e-7)failures.push(row);
  if(w.id==='spillway'&&side===-1&&sign===1&&hz===60&&[.7,.8].includes(gap))examples.push({name:`spillway-gap-${gap}`,initial,dt,frames,final:r,row});
 }

// A body directly on the shove path still obstructs it; allowing existing
// close contact to separate must never allow the current to push through Joe.
const blocked=[];
for(const side of [-1,1])for(const gap of [.66,.7,.8]){
 const w=WATERS.find(w=>w.id==='spillway'),r=fixture(w,side,0,1/60);
 Object.assign(r.joe,waterPoint(w,0,side*(w.depth/2-.1+gap)));
 const before=structuredClone(r);step(r,{});
 const row={side,gap,movement:distance(before.player,r.player),initialGap:distance(before.player,before.joe),playerGapToOriginalJoe:distance(r.player,before.joe)};blocked.push(row);
 assert(row.playerGapToOriginalJoe>=Math.min(.75,row.initialGap)-1e-6);
 assert(row.movement<=Math.max(0,gap-.75)+1e-6);
}
const report={passed:failures.length===0,rows,failures,blocked,limits:['Valid warning-boundary fixtures, not complete approaches or first-time player sessions.','Measures body/world collision and recovery movement, not rendered hand/tool contact or eventual survival.']};
// A dry-bank approach reaches the same condition through ordinary forward
// input. Joe starts in the warning flow and keeps his live turn/attack state.
const approaches=[];
for(const side of [-1,1])for(const steer of ['none','left','right','retreat']){
 const w=WATERS.find(w=>w.id==='spillway'),r=createRun(),dt=1/60;
 Object.assign(r,{mode:'playing',time:2.5-.85/3.84+.02});
 Object.assign(r.player,waterPoint(w,0,side*(w.depth/2+.75)),{yaw:side<0?0:Math.PI,grace:0});
 const j=waterPoint(w,.7,side*(w.depth/2-.1));
 Object.assign(r.joe,j,{phase:'walk',yaw:Math.atan2(r.player.x-j.x,r.player.y-j.y),last:{...r.player}});
 assert(!inWater(r.player,w,.3)&&!solid(r.player,.3)&&!solid(r.joe,JOE_RADIUS));
 const initial=structuredClone(r),inputs=[],frames=[];let hitFrame=null;
 for(let frame=0;frame<60&&r.mode==='playing';frame++){
  const input=hitFrame===null?{forward:1}:steer==='left'?{strafe:-1}:steer==='right'?{strafe:1}:steer==='retreat'?{forward:-1}:{};
  inputs.push(input);step(r,input,dt);
  if(r.waterHits&&hitFrame===null)hitFrame=inputs.length;
  frames.push({frame:inputs.length,player:{...r.player},mode:r.mode,hits:r.waterHits});
 }
 const row={side,steer,hitFrame,mode:r.mode,hits:r.waterHits,cleared:!inWater(r.player,w,.3),player:r.player};
 approaches.push(row);examples.push({name:`approach-${side}-${steer}`,initial,dt,inputs,hitFrame,frames,final:r,row});
 if(!baseline){assert(hitFrame!==null);assert(row.cleared);assert.equal(row.hits,1);assert.equal(row.mode,'playing');}
}
report.approaches=approaches;
fs.writeFileSync(`${out}/${baseline?'baseline':'verified'}.json`,JSON.stringify(report,null,2));
fs.writeFileSync(`${out}/${baseline?'baseline-':'current-'}examples.json`,JSON.stringify(examples));
console.log(JSON.stringify({baseline,cases:rows.length,failures:failures.length,blocked:blocked.length,approaches:approaches.length}));
if(!baseline)assert.deepEqual(failures,[]);
