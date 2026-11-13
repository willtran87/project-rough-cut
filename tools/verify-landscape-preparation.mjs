import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import * as THREE from '../web/vendor/three/three.module.js';
import * as current from '../web/back-nine-landscape.js';
import {COURSE,navigationStats} from '../web/back-nine-course.js';
const out='output/back-nine-experience/terrain-cost';
const before=await import('data:text/javascript;base64,'+Buffer.from(fs.readFileSync(out+'/before-yield/back-nine-landscape.js','utf8')).toString('base64'));
const initial=JSON.stringify(COURSE),nav=navigationStats();
async function capture(api,asyncBuild){
 const hash=createHash('sha256');let parts=0,yields=0,clock=0;
 const put=(g,...args)=>{parts++;clock+=3;hash.update(JSON.stringify(args));for(const name of Object.keys(g.attributes).sort()){const a=g.attributes[name];hash.update(name+':'+a.itemSize+':'+a.normalized);hash.update(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength));}if(g.index)hash.update(Buffer.from(g.index.array.buffer,g.index.array.byteOffset,g.index.array.byteLength));};
 const box=(...args)=>{parts++;clock+=3;hash.update('box'+JSON.stringify(args));};
 const cylinder=new THREE.CylinderGeometry(1,1,1,12),circle=new THREE.CircleGeometry(1,28);circle.rotateX(-Math.PI/2);
 const turfColors=Object.fromEntries(Object.entries({grass:0x455b43,fairway:0x687e5b,fairwayCut:0x718563,green:0x819279}).map(([k,c])=>[k,new THREE.Color(c)]));
 const options={THREE,put,box,cylinder,circle,COURSE,turfColors},yieldPreparation=async()=>{yields++;};
 const descriptor=Object.getOwnPropertyDescriptor(globalThis,'performance');
 try{
  // Deterministic construction clock verifies scheduling independent of host speed.
  Object.defineProperty(globalThis,'performance',{configurable:true,value:{now:()=>clock}});
  const landscape=asyncBuild?await api.buildEstateGroundAsync(options,yieldPreparation):api.buildEstateGround(options);
  for(const [i,route]of [...COURSE.paths,...COURSE.footPaths].entries())for(const offset of [-.7,0,.7]){
   const args=[THREE,put,'track',api.roundedCourseRoute(route,i?2.3:4.2),i?3.4:4.1,.03,false,offset];
   if(asyncBuild)await api.courseRibbonAsync(yieldPreparation,...args);else api.courseRibbon(...args);
  }
  return {hash:hash.digest('hex'),parts,landscape,yields};
 }finally{Object.defineProperty(globalThis,'performance',descriptor);cylinder.dispose();circle.dispose();}
}
const baseline=await capture(before,false),sync=await capture(current,false),asyncResult=await capture(current,true);
assert.deepEqual(sync,baseline);assert.deepEqual({...asyncResult,yields:0},baseline);assert(asyncResult.yields>100);
assert.equal(JSON.stringify(COURSE),initial);assert.deepEqual(navigationStats(),nav);
fs.writeFileSync(out+'/landscape-preparation.json',JSON.stringify({passed:true,baseline,sync,asyncResult,navigation:nav},null,2));
console.log(JSON.stringify({passed:true,parts:baseline.parts,yields:asyncResult.yields,hash:baseline.hash}));
