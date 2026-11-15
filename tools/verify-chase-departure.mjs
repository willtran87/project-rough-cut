import fs from 'node:fs';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {createRun,updateRun} from '../web/back-nine-sim.js';
import {leaveBrokenCart} from '../web/chase-player.js';
import {COURSE,clamp,angleDelta,distance,blocked} from '../web/back-nine-course.js';
import {vehicleOverlap,hullOverlap} from '../web/vehicle-contact.js';
import {departureActive} from '../web/chase-departure.js';
import {panicPose} from '../web/chase-panic.js';
import {chaseMessages} from '../web/back-nine-messages.js';
const out='output/back-nine-experience/opening-pacing',rows=[];
for(const behavior of ['drive','wait','slow'])for(const hz of [30,60]){
 const r=createRun(0,0,42);r.mode='driving';assert(distance(r.cart,r.joe)>70);assert(!blocked(r.joe,2.8));let i=1,firstHit=null,notice=null,released=null,ramStart=null,ramLength=null,maxStep=0,quiet=true;const stages=new Set();
 for(let f=0;f<hz*30&&r.mode==='driving';f++){
  const c=r.foot||r.cart;while(i<COURSE.paths[0].length-1&&distance(c,{x:COURSE.paths[0][i][0],y:COURSE.paths[0][i][1]})<7)i++;const target={x:COURSE.paths[0][i][0],y:COURSE.paths[0][i][1]},turn=angleDelta(Math.atan2(target.x-c.x,target.y-c.y),c.yaw),old={...r.joe},oldRam=r.joe.ram.phase;
  updateRun(r,{throttle:behavior==='wait'?0:behavior==='slow'&&c.speed>5?0:1,steer:behavior==='wait'?0:clamp(turn*2,-1,1),brake:Math.abs(turn)>.7&&c.speed>8},1/hz);stages.add(r.encounter.stage);maxStep=Math.max(maxStep,distance(old,r.joe));assert(!vehicleOverlap(r.cart,r.joe));
  if(departureActive(r)){assert.equal(r.cart.hits,0);assert.equal(r.joe.ram.phase,'none');assert.equal(r.joe.reverse,0,'A deliberate working/notice stop must not trigger stuck recovery');assert(r.joe.speed<=3.201);quiet&&=chaseMessages(r).banner==='';}
  if(r.departure.phase==='notice'&&notice===null){notice=r.time;assert(r.panic.phase==='reveal'||behavior==='wait');if(r.panic.phase==='reveal'){assert.equal(r.panic.revealDuration,1.65);assert(panicPose(r).motor<.2);}}
  if(r.departure.releasedAt!==null&&released===null)released=r.departure.releasedAt;
  if(oldRam!=='lineup'&&r.joe.ram.phase==='lineup'&&ramStart===null)ramStart=r.time;
  if(oldRam==='lineup'&&r.joe.ram.phase!=='lineup'&&ramLength===null)ramLength=r.time-ramStart;
  if(r.cart.hits&&firstHit===null)firstHit=r.time;
 }
 assert(notice!==null&&released!==null);assert(released-notice>=1.65-1e-8);assert(released-notice<1.65+1/hz+.001);assert(firstHit>released+1.8);assert(ramLength>=1.8-1/hz-1e-8,JSON.stringify({behavior,hz,ramLength}));assert(maxStep<36.5/hz+.003);assert(quiet);assert(stages.has('departure')&&stages.has('pursuit'));rows.push({behavior,hz,notice,released,firstHit,ramLength,maxStep,health:r.cart.health,stages:[...stages]});
}
for(const checkpoint of [1,2]){const r=createRun(checkpoint);assert.equal(r.departure.phase,'finished');assert.equal(r.joe.y,COURSE.checkpoints[checkpoint-1].y-28);assert.equal(r.joe.yaw,0);}
const paused=createRun();paused.mode='paused';const frozen=JSON.stringify(paused);updateRun(paused,{throttle:1},10);assert.equal(JSON.stringify(paused),frozen);
// Same starting wreck and live Joe: the former selection put the landing
// behind the rear panel, although a safe side exit was available.
const source=fs.readFileSync(out+'/baseline-source/chase-player.js','utf8').replace(/from '(\.\/[^']+)'/g,(_,name)=>`from '${pathToFileURL(process.cwd()+'/web/'+name.slice(2)).href}'`),before=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64')),ejections=[];
for(const [kind,leave]of [['before',before.leaveBrokenCart],['after',leaveBrokenCart]]){const r=createRun();r.mode='driving';leave(r);const start={...r.foot};for(let n=0;n<140;n++){updateRun(r,{throttle:1},1/60);assert(!hullOverlap(r.foot,'foot',r.cart,'cart'));assert(!blocked(r.foot,.32));}ejections.push({kind,start:{x:start.x,y:start.y},moved:distance(start,r.foot),forward:r.foot.y-start.y});}
assert(ejections[0].forward<2,JSON.stringify(ejections));assert(ejections[1].forward>8);fs.writeFileSync(out+'/simulation.json',JSON.stringify({passed:true,rows,ejections},null,2));console.log(JSON.stringify({passed:true,rows,ejections}));
