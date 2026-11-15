import assert from 'node:assert/strict';
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import {floorLayout} from '../web/under-green-course.js';
import {mudDepositProfile,mudWallSpans} from '../web/under-green-mud-profile.js';
import {buildDrainOrganicGeometry} from '../web/under-green-organic-geometry.js';
const out='output/under-green/visual-upgrade/pass35-source',layout=floorLayout();
const oldSource=fs.readFileSync(out+'/under-green-organic-geometry-before.js','utf8').replace(/from '\.\/([^']+)'/g,(_,f)=>`from '${pathToFileURL(process.cwd()+'/web/'+f).href}'`);
const old=await import('data:text/javascript;base64,'+Buffer.from(oldSource).toString('base64'));
function collect(build){const roots=[],banks=[],other=[];const stats=build({layout,materials:{},root(...args){roots.push(args);},put(g,type,x,y,z){const data={type,x,y,z,position:Array.from(g.attributes.position.array),normal:Array.from(g.attributes.normal.array),index:Array.from(g.index?.array||[])};(type==='mudBank'?banks:other).push(data);}});return {roots,banks,other,stats};}
const a=collect(old.buildDrainOrganicGeometry),b=collect(buildDrainOrganicGeometry);
assert.deepEqual(a.roots,b.roots,'Root placement changed');assert.deepEqual(a.other,b.other);
const spans=mudWallSpans(layout);let samples=0,maxHeight=0,maxFoot=0,quiet=0;
for(const s of spans){
 for(const t of [s.start,s.end])assert.equal(mudDepositProfile(t,s.boundary,s.start,s.end).height,.004);
 for(let t=s.start;t<s.end;t+=.015){const p=mudDepositProfile(t,s.boundary,s.start,s.end);assert(p.height>=.004&&p.height<=.304);assert(p.foot<=.19700001&&p.foot>=.114);maxHeight=Math.max(maxHeight,p.height);maxFoot=Math.max(maxFoot,p.foot);if(p.height<.025)quiet++;samples++;}
}
for(const bank of b.banks){assert(bank.position.every(Number.isFinite));assert(bank.index.every(i=>i>=0&&i<bank.position.length/3));}
// Shared rows at renderer chunk boundaries retain identical world positions
// and normals. These are render cuts, never a new sediment end or hard edge.
let joinedRows=0;const regular=b.banks.slice(0,b.stats.mudBanks);
for(let i=1;i<regular.length;i++){
 const a=regular[i-1],c=regular[i],n=a.position.length-15;
 const close=[0,1,2].every(k=>Math.abs(a.position[n+k]+[a.x,a.y,a.z][k]-c.position[k]-[c.x,c.y,c.z][k])<.00001);
 if(!close)continue;
 for(let j=0;j<15;j++)assert(Math.abs(a.normal[n+j]-c.normal[j])<1e-7);
 joinedRows++;
}
assert(joinedRows>40);
assert(quiet/samples>.2);assert(b.banks.length<a.banks.length);
const triangles=banks=>banks.reduce((n,b)=>n+b.index.length/3,0);
const report={passed:true,originalBanks:a.banks.length,banks:b.banks.length,originalTriangles:triangles(a.banks),triangles:triangles(b.banks),unchangedRootCalls:b.roots.length,samples,maxHeight,maxFoot,quietFraction:quiet/samples,joinedRows,stats:b.stats};
fs.writeFileSync(out+'/geometry-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
