import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun} from '../web/under-green-sim.js';
import {createGratingCue,onServiceGrate,buildServiceGrate} from '../web/under-green-grating.js';
import {solid} from '../web/under-green-course.js';
import {traverse} from './probe-under-green-folded.mjs';
const out='output/under-green/service-grate';fs.mkdirSync(out,{recursive:true});
const r=createRun(1);r.mode='playing';r.time=1;Object.assign(r.player,{x:-20,y:40,yaw:0});
const event={owner:r,time:1,serial:1,x:-7,y:40,foot:0},cue=createGratingCue();
cue.update(r,[event]);assert.match(cue.caption(r),/metal to your right/);
r.player.rearAngle=Math.PI;assert.match(cue.caption(r),/metal to your left/);
r.mode='paused';assert.equal(cue.caption(r),'');r.mode='playing';r.time=2.16;assert.equal(cue.caption(r),'');
cue.update(r,[event]);assert.equal(cue.caption(r),'','Old contacts cannot be replayed');
r.time=3;cue.update(r,[{...event,owner:{},time:3}]);assert.equal(cue.caption(r),'');
cue.update(r,[{...event,time:3,x:0}]);assert.equal(cue.caption(r),'','Stone contacts stay ordinary');
Object.assign(r.player,{x:12,y:10});cue.update(r,[{...event,time:3}]);assert.equal(cue.caption(r),'','Inaudible landing supplies no cue');
const retry=createRun(1);retry.mode='playing';cue.update(retry,[]);assert.equal(cue.caption(retry),'');
const pieces=[];buildServiceGrate((material,x,h,z,w,t,d)=>pieces.push({material,x,h,z,w,t,d}));
assert(pieces.every(p=>p.h+p.t/2<.002));
for(const p of pieces)for(const sx of [-1,1])for(const sz of [-1,1])assert(!solid({x:p.x+sx*p.w/2,y:-p.z+sz*p.d/2},0));
assert(onServiceGrate({x:-7,y:40})&&!onServiceGrate({x:-7,y:42}));
const routes=[];
for(const [name,options]of [['dry',{}],['wet',{wet:true}]]){
 const frames=[];let frame=0;
 const result=traverse({...options,dodge:true,inspect:r=>{
  if(++frame%2||r.elapsed<33||r.elapsed>53)return;
  const {telemetry,...state}=r;frames.push(structuredClone(state));
 }});
 assert.equal(result.mode,'complete');routes.push({name,result,frames});
}
fs.writeFileSync(`${out}/routes.json`,JSON.stringify(routes));
fs.writeFileSync(`${out}/rules.json`,JSON.stringify({passed:true,checks:['Contact owner/time/material/audibility and expiry govern cue','Pause, duplicate contact, retry and rear-view direction','All metal geometry is inside walkable floor and below soles','Continuous wet/dry route outcomes retained'],routes:routes.map(({name,result})=>({name,mode:result.mode,seconds:result.elapsed,hits:result.waterHits,gap:result.gap})),pieces:pieces.length},null,2));
console.log(JSON.stringify({passed:true,routes:routes.map(({name,frames})=>({name,frames:frames.length}))}));
