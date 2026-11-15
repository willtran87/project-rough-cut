import fs from 'node:fs';
import assert from 'node:assert/strict';
import {performance} from 'node:perf_hooks';
import {createRunnerGait} from '../web/runner-gait.js';
import {terrainHeight} from '../web/course-terrain.js';
const out='output/back-nine-experience/runner-terrain';
const old=await import('data:text/javascript;base64,'+Buffer.from(fs.readFileSync(out+'/baseline-source/runner-gait.js','utf8')).toString('base64'));
let samples=0,terrainCalls=0,maxCallCount=0;
for(const hz of [15,30,60])for(const kind of ['forward','reverse','arc','pivot','stop','restart','reset']){
 const before=old.createRunnerGait(),after=createRunnerGait(),flat=createRunnerGait(()=>0),slope=createRunnerGait((x,y)=>{terrainCalls++;return terrainHeight(x,y);}),f={x:25,y:266,speed:0,travelSign:kind==='reverse'?-1:1};let yaw=-.7;
 for(let n=0;n<hz*4;n++){
  const time=n/hz,moving=kind!=='pivot'&&!(kind==='stop'&&n>hz)&&!(kind==='restart'&&n>hz&&n<hz*2);
  if(['arc','pivot'].includes(kind))yaw+=1.3/hz;
  f.speed=moving?6.6:0;f.x+=Math.sin(yaw)*f.speed/hz*f.travelSign;f.y+=Math.cos(yaw)*f.speed/hz*f.travelSign;
  if(kind==='reset'&&n===hz*2){f.x=-12;f.y=371;}
  const a=before.update(f,time,yaw),b=after.update(f,time,yaw),c=flat.update(f,time,yaw),start=terrainCalls,d=slope.update(f,time,yaw);
  maxCallCount=Math.max(maxCallCount,terrainCalls-start);
  for(let k=0;k<2;k++)for(const prop of ['x','y','z','pitch','lift','planted']){assert.equal(b.feet[k][prop],a.feet[k][prop]);assert.equal(c.feet[k][prop],a.feet[k][prop]);}
  assert.equal(b.hipHeight,a.hipHeight);assert.equal(c.hipHeight,a.hipHeight);
  const snapshot=JSON.stringify(d),calls=terrainCalls;for(let n=0;n<5;n++)slope.update(f,time,yaw);assert.equal(JSON.stringify(d),snapshot);assert.equal(terrainCalls,calls,'same-time presentation samples no ground');samples++;
 }
}
assert.equal(maxCallCount,11);
// Warm, interleaved CPU batches. This measures gait work, not GPU frame time.
const timings=[[],[]],gaits=[old.createRunnerGait(),createRunnerGait(terrainHeight)],bodies=[{x:0,y:0,speed:6.6},{x:0,y:0,speed:6.6}];let iteration=0;
for(let block=0;block<36;block++)for(const id of [0,1,1,0]){
 const begin=performance.now(),f=bodies[id];for(let n=0;n<512;n++){const k=iteration++,yaw=Math.sin(k*.01);f.x=24+Math.sin(k*.003)*3;f.y=260+Math.cos(k*.003)*3;gaits[id].update(f,k/60,yaw);}
 if(block>=4)timings[id].push((performance.now()-begin)/512);
}
const cpu=timings.map(a=>{a.sort((x,y)=>x-y);return {medianMs:a[Math.floor(a.length*.5)],p95Ms:a[Math.floor(a.length*.95)]};});
fs.writeFileSync(out+'/rules.json',JSON.stringify({passed:true,samples,maxCallCount,terrainCalls,cpu},null,2));console.log(JSON.stringify({passed:true,samples,maxCallCount,terrainCalls,cpu}));
