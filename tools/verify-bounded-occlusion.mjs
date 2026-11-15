import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from '../web/vendor/three/three.module.js';
import {createSolidOcclusion} from '../web/solid-occlusion.js';
let seed=71;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
const full=createSolidOcclusion(),limits=[1,4,24],bounded=limits.map(maxSolids=>createSolidOcclusion({maxSolids})),matrix=new T.Matrix4();
const box=(x,y,z,w,h,d)=>new T.Box3(new T.Vector3(x-w/2,y-h/2,z-d/2),new T.Vector3(x+w/2,y+h/2,z+d/2));
const walls=[box(0,1,-5,5,4,.4),...Array.from({length:80},()=>box((random()-.5)*35,1.5,-random()*45,.3+random()*4,3,.3+random()*4))];
for(const wall of walls)for(const o of [full,...bounded])o.add(wall,matrix);
const targets=[box(0,1,-8,.3,.3,.3),...Array.from({length:1000},()=>box((random()-.5)*40,random()*4,-random()*50,.1+random(),.1+random(),.1+random()))];
const camera=new T.PerspectiveCamera(58,16/9,.06,85);let checks=0,hidden=0;
for(let view=0;view<32;view++){
 camera.position.set(view?(random()-.5)*30:0,1.65,view?-random()*25:0);camera.rotation.set(view?(random()-.5)*1.6:0,view?(random()-.5)*6:0,0);camera.updateMatrixWorld();
 full.update(camera);bounded.forEach((o,i)=>{o.update(camera);assert(o.count()<=limits[i]);});
 for(const target of targets){const expected=full.hidden(target);for(const o of bounded){const actual=o.hidden(target);assert(!actual||expected,'A subset must not invent occlusion');checks++;hidden+=actual;}}
}
assert(hidden>0);for(const maxSolids of [0,-1,1.5,NaN])assert.throws(()=>createSolidOcclusion({maxSolids}),RangeError);
fs.mkdirSync('output/under-green/solid-culling',{recursive:true});fs.writeFileSync('output/under-green/solid-culling/bounded-unit.json',JSON.stringify({passed:true,checks,hidden,limits}));
console.log(JSON.stringify({passed:true,checks,hidden,limits}));
