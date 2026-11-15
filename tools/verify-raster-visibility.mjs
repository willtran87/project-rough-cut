import assert from 'node:assert/strict';
import * as THREE from '../web/vendor/three/three.module.js';
import {readFileSync} from 'node:fs';
import {triangleHasSamples,createRasterVisibility,prepareRasterVisibility} from '../web/raster-visibility.js';
import {createCourseBatchCulling} from '../web/course-batch-culling.js';
let seed=713,tested=0,rejected=0;
const random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
// Independent point-in-triangle reference. Include reversed winding, thin
// slivers, degenerates and sample-centre boundary cases with tiny jitter.
for(let i=0;i<50000;i++){
 const v=Array.from({length:6},()=>random()*5-2),[ax,ay,bx,by,cx,cy]=v;
 if(i%5===0){v[0]=.5+(random()-.5)*1e-7;v[1]=.5+(random()-.5)*1e-7;}
 const area=(v[2]-v[0])*(v[5]-v[1])-(v[3]-v[1])*(v[4]-v[0]);
 for(const side of [0,1,2]){
  const keep=triangleHasSamples(...v,side);tested++;if(keep)continue;rejected++;
  if(side===0&&area<0||side===1&&area>0||area===0)continue;
  for(let x=-3;x<=3;x++)for(let y=-3;y<=3;y++){
   const edges=[0,2,4].map((a,j)=>{const b=[2,4,0][j];return (v[b]-v[a])*(y+.5-v[a+1])-(v[b+1]-v[a+1])*(x+.5-v[a]);});
   assert(!(edges.every(e=>e>=0)||edges.every(e=>e<=0)),'Rejected a covered sample');
  }
 }
}
const g=new THREE.PlaneGeometry(10,10,90,90);g.computeBoundingBox();
const source=g.index.array.slice(),attrs=Object.fromEntries(Object.entries(g.attributes).map(([k,a])=>[k,a.array.slice()]));
const mesh=new THREE.Mesh(g,new THREE.MeshBasicMaterial()),c=createCourseBatchCulling();c.register(mesh,[g.clone()],{rasterCull:true,maxTrianglesPerPart:64});
const camera=new THREE.PerspectiveCamera(64,1,.1,100);camera.position.z=25;camera.updateMatrixWorld();
c.update(camera,32,32);const small=g.drawRange.count;assert(small<source.length);
c.update(camera,1024,1024);assert(g.drawRange.count>small,'Resolution change must invalidate sample coverage');
c.restore();assert.deepEqual(g.index.array,source);assert.equal(g.drawRange.count,source.length);
c.update(camera,32,32);assert.equal(g.drawRange.count,small,'Restore must invalidate cached coverage');
c.update(camera);assert.equal(g.drawRange.count,source.length,'Unknown target size must fail open');
for(const[k,a]of Object.entries(attrs))assert.deepEqual(g.attributes[k].array,a);
assert(await prepareRasterVisibility(readFileSync(new URL(process.argv.includes('--simd')?'../web/raster-visibility-simd.wasm':'../web/raster-visibility.wasm',import.meta.url))));
const ga=g.clone(),gb=g.clone();ga.index.array.set(source);gb.index.array.set(source);
const reference=createRasterVisibility(ga,source,2,1,false),accelerated=createRasterVisibility(gb,source,2,1);
assert.equal(accelerated.stats().backend,'wasm');
const projection=new THREE.Matrix4(),part=[{offset:0,count:source.length,visible:true}];
for(let i=0;i<100;i++){
 camera.position.set(Math.sin(i)*30,Math.cos(i*.37)*8,i%4===0?.12:25);camera.lookAt(0,0,0);camera.updateMatrixWorld();projection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);
 const size=[32,640,960,2560][i%4];reference.update(projection,size,size,part);accelerated.update(projection,size,size,part);
 assert.equal(ga.drawRange.count,gb.drawRange.count);assert.deepEqual(ga.index.array.slice(0,ga.drawRange.count),gb.index.array.slice(0,gb.drawRange.count),'Compiled coverage must match the reference exactly');
 if(i%7===0){ga.index.array.set(source);gb.index.array.set(source);ga.index.needsUpdate=gb.index.needsUpdate=true;}
}
console.log(JSON.stringify({passed:true,tested,rejected,resize:true,restore:true,attributesUnchanged:true,compiledCameraComparisons:100,compiledBytes:accelerated.stats().bytes}));
