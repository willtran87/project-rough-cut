import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from '../web/vendor/three/three.module.js';
import {COURSE} from '../web/back-nine-course.js';
import {buildBunkerBanks} from '../web/back-nine-bunker-banks.js';
import {contourGround} from '../web/course-terrain.js';

const oldSource=fs.readFileSync('output/back-nine-visual-upgrade/bunker-depth/baseline-source/course-terrain.js','utf8').replace("'./back-nine-course.js'",JSON.stringify(new URL('../web/back-nine-course.js',import.meta.url).href));
const {contourGround:original}=await import('data:text/javascript;base64,'+Buffer.from(oldSource).toString('base64'));
function bytes(a){return Buffer.from(a.buffer,a.byteOffset,a.byteLength);}
function area(g){const p=g.attributes.position;let sum=0;for(let i=0;i<g.index.count;i+=3){const a=g.index.getX(i),b=g.index.getX(i+1),c=g.index.getX(i+2);sum+=Math.abs((p.getX(b)-p.getX(a))*(p.getZ(c)-p.getZ(a))-(p.getZ(b)-p.getZ(a))*(p.getX(c)-p.getX(a)))/2;}return sum;}
let before=0,after=0,defaults=0,maxAreaDelta=0;const banks=[];
for(const s of COURSE.sand){let oldCount=0,newCount=0;
 for(const {geometry:g,role}of buildBunkerBanks(s,COURSE.paths).parts){
  const old=original(THREE,g),unchanged=contourGround(THREE,g),current=contourGround(THREE,g,{retainFlatTriangles:!!g.userData.bunkerSurface});
  assert.deepEqual(bytes(old.index.array),bytes(unchanged.index.array));
  for(const key of Object.keys(old.attributes))assert.deepEqual(bytes(old.attributes[key].array),bytes(unchanged.attributes[key].array),'default terrain callers remain bit-identical');
  defaults++;
  const delta=Math.abs(area(old)-area(current));maxAreaDelta=Math.max(maxAreaDelta,delta);assert(delta<.003,'projected footprint is retained within float tessellation error');
  assert(current.index.count<=old.index.count);
  if(role==='footprint'){assert.deepEqual(bytes(old.index.array),bytes(current.index.array));for(const key of Object.keys(old.attributes))assert.deepEqual(bytes(old.attributes[key].array),bytes(current.attributes[key].array));}
  oldCount+=old.index.count/3;newCount+=current.index.count/3;
  old.dispose();unchanged.dispose();current.dispose();g.dispose();
 }
 before+=oldCount;after+=newCount;banks.push({y:s.y,before:oldCount,after:newCount});
}
assert(after<before*.7,'remove redundant bank subdivision, not merely a few triangles');
const report={passed:true,before,after,reduction:1-after/before,defaultGeometryComparisons:defaults,maxAreaDelta,banks,checks:['all default attribute/index buffers identical to saved implementation','all footprint geometry unchanged','same projected bank coverage','only opted-in flat terrain skips clipping; current bank verifier checks terrain contact']};
fs.writeFileSync('output/back-nine-visual-upgrade/bunker-depth/tessellation.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
