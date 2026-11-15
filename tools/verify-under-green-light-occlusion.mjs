import assert from 'node:assert/strict';
import * as T from '../web/vendor/three/three.module.js';
import {createDrainLightOcclusion} from '../web/under-green-light-occlusion.js';

const box=(a,b)=>new T.Box3(new T.Vector3(...a),new T.Vector3(...b));
const wall=box([-.1,-4,-4],[.1,4,4]),source=new T.Vector3(-3,0,0),proof=createDrainLightOcclusion([wall]);
assert(proof.hidden(source,box([2,-.5,-.5],[3,.5,.5]),13));
assert(!proof.hidden(source,box([-.5,-.5,-.5],[.2,.5,.5]),13),'A receiver touching a wall must fail open');
assert(!proof.hidden(new T.Vector3(),box([2,-.5,-.5],[3,.5,.5]),13),'A lamp inside an occluder must fail open');
assert(!proof.hidden(source,box([-2,-.5,-.5],[-1,.5,.5]),13),'A surface before the wall must retain the light');
const doorway=createDrainLightOcclusion([box([-.1,-4,-4],[.1,4,-1]),box([-.1,-4,1],[.1,4,4])]);
assert(!doorway.hidden(source,box([2,-.3,-.3],[3,.3,.3]),13),'An opening must remain lit');
assert(!createDrainLightOcclusion([]).hidden(source,box([2,-.5,-.5],[3,.5,.5]),13));

// Audit the analytic cone proof against independent ray/box intersections,
// including the receiver shift used by depth bias and neighboring PCF taps.
let seed=812137;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const ray=new T.Ray(),direction=new T.Vector3(),hit=new T.Vector3();let hidden=0,points=0,taps=0;
for(let axis=0;axis<3;axis++)for(const sign of [-1,1]){
 const mins=[-4,-4,-4],maxs=[4,4,4];mins[axis]=-.1;maxs[axis]=.1;const blocker=box(mins,maxs),occlusion=createDrainLightOcclusion([blocker]);
 const origin=new T.Vector3();origin.setComponent(axis,-sign*3);
 for(let sample=0;sample<180;sample++){
  const center=new T.Vector3((random()-.5)*14,(random()-.5)*14,(random()-.5)*14);center.setComponent(axis,sign*(.2+random()*8));
  const size=new T.Vector3(.05+random()*1.4,.05+random()*1.4,.05+random()*1.4),bounds=new T.Box3().setFromCenterAndSize(center,size);
  if(!occlusion.hidden(origin,bounds,13))continue;hidden++;
  for(const x of [0,.25,.5,.75,1])for(const y of [0,.25,.5,.75,1])for(const z of [0,.25,.5,.75,1]){
   const point=new T.Vector3(bounds.min.x+(bounds.max.x-bounds.min.x)*x,bounds.min.y+(bounds.max.y-bounds.min.y)*y,bounds.min.z+(bounds.max.z-bounds.min.z)*z),d=point.clone().sub(origin),abs=d.toArray().map(Math.abs),major=Math.max(...abs);points++;
   if(major>=13||major<=.05)continue;
   const face=abs.indexOf(major),other=[0,1,2].filter(a=>a!==face),biased=major-(.035+major*.003);
   for(const u of [-1,0,1])for(const v of [-1,0,1]){
    const receiver=d.clone().multiplyScalar(biased/major);receiver.setComponent(other[0],receiver.getComponent(other[0])+u*2*biased/128);receiver.setComponent(other[1],receiver.getComponent(other[1])+v*2*biased/128);receiver.add(origin);
    direction.copy(receiver).sub(origin);const length=direction.length();direction.normalize();ray.set(origin,direction);assert(ray.intersectBox(blocker,hit)&&hit.distanceTo(origin)<length-.000001,'A culled PCF tap has an unobstructed ray');taps++;
   }
  }
 }
}
assert(hidden>100&&taps>100000);console.log(JSON.stringify({passed:true,hidden,points,taps,manualChecks:6}));
