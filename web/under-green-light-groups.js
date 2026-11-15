import * as THREE from './vendor/three/three.module.js';

// Broad surfaces pay lighting cost across many pixels. Keep their original
// geometry but group pieces by the lamps that can actually reach them.
// Fine roots/hardware stay batched: splitting those costs more draws than it
// saves shading. No attributes, triangle order within a group or light math
// are changed; the practical-light binder still proves each final omission.
const surfaces=new Set(['rootStone','bunkerStone','pumpStone','rangeStone','keeperStone','stone','floor','walkway','ceiling','bankEarth','mudBank']);
export function groupDrainSurfaceLights(batches,lamps){
 const sources=lamps.map(l=>({point:new THREE.Vector3(l.x,l.height??2.8,-l.y),reach:l.reach??13})),result=[],groups=new Map();
 for(const batch of batches){
  if(!surfaces.has(batch.type)){result.push(batch);continue;}
  for(const part of batch.parts){
   part.computeBoundingBox();
   const key=batch.type+':'+sources.map((l,i)=>part.boundingBox.distanceToPoint(l.point)<=l.reach+.01?i:-1).filter(i=>i>=0).join(',');
   if(!groups.has(key)){const group={...batch,parts:[]};groups.set(key,group);result.push(group);}
   groups.get(key).parts.push(part);
  }
 }
 return result;
}
