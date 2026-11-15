import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DRAIN_SHALLOW_PATCHES,insideWetPolygon,shallowWaterHeight,SHALLOW_WATER_HEIGHT} from '../web/under-green-wet-ground.js';
const reference=point=>DRAIN_SHALLOW_PATCHES.some(p=>insideWetPolygon(point,p.points))?SHALLOW_WATER_HEIGHT:null;
const points=[];
for(let x=-36;x<=26;x+=.25)for(let y=0;y<=80;y+=.25)points.push({x,y});
// Include every authored vertex and edge midpoint, with probes on both sides
// of the exact boundary. A bounding-box shortcut must preserve edge semantics.
for(const patch of DRAIN_SHALLOW_PATCHES)for(let i=0;i<patch.points.length;i++){
 const a=patch.points[i],b=patch.points[(i+1)%patch.points.length];
 for(const t of [0,.5])for(const dx of [-1e-9,0,1e-9])for(const dy of [-1e-9,0,1e-9])points.push({x:a[0]+(b[0]-a[0])*t+dx,y:a[1]+(b[1]-a[1])*t+dy});
}
const expected=points.map(reference);
for(let i=0;i<points.length;i++)assert.equal(shallowWaterHeight(points[i]),expected[i],JSON.stringify(points[i]));
function bench(fn){let wet=0;const start=performance.now();for(let pass=0;pass<3;pass++)for(const p of points)if(fn(p)!==null)wet++;return {ms:performance.now()-start,wet};}
const before=bench(reference),after=bench(shallowWaterHeight);assert.equal(after.wet,before.wet);
const report={passed:true,points:points.length,patches:DRAIN_SHALLOW_PATCHES.length,reference:before,candidate:after,speedup:before.ms/after.ms};
fs.mkdirSync('output/under-green/runtime-fix',{recursive:true});fs.writeFileSync('output/under-green/runtime-fix/shallow-query.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
