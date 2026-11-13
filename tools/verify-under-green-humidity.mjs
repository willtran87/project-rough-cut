import assert from 'node:assert/strict';
import {humiditySamples,HUMIDITY_POCKETS} from '../web/under-green-humidity.js';
import {createRun} from '../web/under-green-sim.js';
import {onFloor} from '../web/under-green-course.js';
let samples=0,edgeSamples=0,maximum=0;
for(const bypass of [false,true])for(let time=0;time<=200;time+=.5){
 const r=createRun();r.time=time;r.elapsed=time;r.bypass=bypass;r.bypassAt=20;
 const points=humiditySamples(r);maximum=Math.max(maximum,points.length);assert.equal(new Set(points.map(p=>p.index)).size,points.length);
 for(const p of points){
  assert(p.height-p.tall/2>=p.surface+.0179);assert(p.alpha>0&&p.alpha<=.075);
  for(const n of ['x','y','height','width','tall','alpha'])assert(Number.isFinite(p[n]));
  const radius=Math.hypot(p.width,p.tall)/2;for(let i=0;i<64;i++){const a=i*Math.PI/32;assert(onFloor(p.x+Math.cos(a)*radius,p.y+Math.sin(a)*radius),p.id+' crosses physical boundary');edgeSamples++;}
  samples++;
 }
 const repeat=humiditySamples(r);assert.deepEqual(points,repeat);
 // Reduced-motion drift and breathing opacity stay fixed; the base height
 // still follows authoritative water/flood changes for truthful immersion.
 const stable=p=>p.map(({id,index,x,y,width,tall,alpha})=>({id,index,x,y,width,tall,alpha}));
 const first=stable(humiditySamples(r,true));r.time+=7;assert.deepEqual(stable(humiditySamples(r,true)),first);
}
assert.equal(HUMIDITY_POCKETS.length,6);assert.equal(maximum,29);
console.log(JSON.stringify({passed:true,pockets:HUMIDITY_POCKETS.length,capacity:maximum,samples,edgeSamples,deterministic:true,reducedMotion:true}));
